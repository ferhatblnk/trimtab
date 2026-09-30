import { spawn, execFileSync } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { BENCHMARK_DIR, SERVER_TIME_ZONE, grade, listTasks, prepareWorkdir, taskPrompt } from './lib.mjs';

const MODES = {
  xhigh: { effort: 'xhigh', plugin: false },
  medium: { effort: 'medium', plugin: false },
  trimtab: { effort: 'medium', plugin: true },
};

const ALLOWED_TOOLS = [
  'Read',
  'Edit',
  'Write',
  'Grep',
  'Glob',
  'Agent',
  'TodoWrite',
  'Bash(node)',
  'Bash(node *)',
  'Bash(npm test)',
  'Bash(npm test *)',
  'Bash(TZ=* node *)',
  'Bash(env TZ=* node *)',
  'Bash(git *)',
  'Bash(ls)',
  'Bash(ls *)',
  'Bash(cat *)',
  'Bash(head *)',
  'Bash(tail *)',
  'Bash(wc *)',
  'Bash(grep *)',
  'Bash(rg *)',
  'Bash(find *)',
  'Bash(sed -n *)',
];

const { values } = parseArgs({
  options: {
    claude: { type: 'string', default: process.env.CLAUDE_BIN ?? 'claude' },
    model: { type: 'string', default: 'claude-opus-5-5' },
    repeats: { type: 'string', default: '2' },
    tasks: { type: 'string', default: listTasks().join(',') },
    modes: { type: 'string', default: Object.keys(MODES).join(',') },
    concurrency: { type: 'string', default: '3' },
    budget: { type: 'string', default: '10' },
    timeout: { type: 'string', default: '30' },
    out: { type: 'string', default: join(BENCHMARK_DIR, 'results') },
  },
});

const outDir = resolve(values.out);
const runsFile = join(outDir, 'runs.jsonl');
const pluginDir = resolve(BENCHMARK_DIR, '..', 'plugin');
mkdirSync(join(outDir, 'diffs'), { recursive: true });

const done = new Set(
  existsSync(runsFile)
    ? readFileSync(runsFile, 'utf8')
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line))
        .map((run) => `${run.task}|${run.mode}|${run.repeat}`)
    : [],
);

const jobs = [];
for (let repeat = 1; repeat <= Number(values.repeats); repeat++) {
  for (const task of values.tasks.split(',')) {
    for (const mode of values.modes.split(',')) {
      if (!MODES[mode]) {
        throw new Error(`Unknown mode: ${mode}`);
      }
      if (!done.has(`${task}|${mode}|${repeat}`)) {
        jobs.push({ task, mode, repeat });
      }
    }
  }
}

console.log(`${jobs.length} runs to go (${done.size} already recorded) → ${runsFile}`);

function runClaude(job, dir) {
  const mode = MODES[job.mode];
  const args = [
    '-p',
    taskPrompt(job.task),
    '--model',
    values.model,
    '--effort',
    mode.effort,
    '--output-format',
    'json',
    '--no-session-persistence',
    '--setting-sources',
    'project,local',
    '--strict-mcp-config',
    '--permission-mode',
    'acceptEdits',
    '--max-budget-usd',
    values.budget,
    '--allowedTools',
    ...ALLOWED_TOOLS,
    ...(mode.plugin ? ['--plugin-dir', pluginDir] : []),
  ];

  return new Promise((resolveRun) => {
    const started = Date.now();
    const child = spawn(values.claude, args, {
      cwd: dir,
      env: { ...process.env, TZ: SERVER_TIME_ZONE },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    const timer = setTimeout(() => child.kill('SIGTERM'), Number(values.timeout) * 60_000);
    child.on('close', (code) => {
      clearTimeout(timer);
      resolveRun({ code, stdout, stderr, wallMs: Date.now() - started });
    });
  });
}

function usageOf(result) {
  const totals = { inputTokens: 0, outputTokens: 0, cacheReadInputTokens: 0, cacheCreationInputTokens: 0, thinkingTokens: 0 };
  for (const usage of Object.values(result?.modelUsage ?? {})) {
    for (const key of Object.keys(totals)) {
      totals[key] += usage[key] ?? 0;
    }
  }
  return { ...totals, totalTokens: totals.inputTokens + totals.outputTokens + totals.cacheReadInputTokens + totals.cacheCreationInputTokens };
}

async function execute(job) {
  const dir = prepareWorkdir(`${job.task}-${job.mode}`);
  const run = await runClaude(job, dir);
  let result = null;
  try {
    result = JSON.parse(run.stdout);
  } catch {
    result = null;
  }

  execFileSync('git', ['add', '-A'], { cwd: dir, stdio: 'ignore' });
  const diff = execFileSync('git', ['diff', '--cached'], { cwd: dir, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  writeFileSync(join(outDir, 'diffs', `${job.task}-${job.mode}-${job.repeat}.patch`), diff);

  const record = {
    task: job.task,
    mode: job.mode,
    repeat: job.repeat,
    model: values.model,
    effort: MODES[job.mode].effort,
    plugin: MODES[job.mode].plugin,
    exitCode: run.code,
    error: result ? (result.is_error ? result.subtype ?? 'error' : null) : `no JSON output: ${run.stderr.slice(-400)}`,
    costUsd: result?.total_cost_usd ?? null,
    durationMs: result?.duration_ms ?? run.wallMs,
    turns: result?.num_turns ?? null,
    tokens: usageOf(result),
    grade: grade(job.task, dir),
    finishedAt: new Date().toISOString(),
  };
  appendFileSync(runsFile, `${JSON.stringify(record)}\n`);
  rmSync(dir, { recursive: true, force: true });

  const cost = record.costUsd === null ? '   n/a' : `$${record.costUsd.toFixed(3)}`;
  console.log(
    `${record.grade.passed ? 'PASS' : 'FAIL'} ${job.task} ${job.mode.padEnd(7)} #${job.repeat} ${cost} ${(record.durationMs / 1000).toFixed(0)}s ${record.tokens.totalTokens} tokens${record.error ? ` (${record.error})` : ''}`,
  );
}

const queue = [...jobs];
await Promise.all(
  Array.from({ length: Math.max(1, Number(values.concurrency)) }, async () => {
    while (queue.length > 0) {
      await execute(queue.shift());
    }
  }),
);
console.log('done');
