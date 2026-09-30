import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { BENCHMARK_DIR } from './lib.mjs';

const MODE_ORDER = ['xhigh', 'medium', 'trimtab'];

const { values } = parseArgs({
  options: {
    out: { type: 'string', default: join(BENCHMARK_DIR, 'results') },
    baseline: { type: 'string', default: 'xhigh' },
    hours: { type: 'string', default: '5' },
  },
});

const outDir = resolve(values.out);
const all = readFileSync(join(outDir, 'runs.jsonl'), 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line));
const modes = MODE_ORDER.filter((mode) => all.some((run) => run.mode === mode));

const complete = new Set(
  [...new Set(all.map((run) => `${run.task}|${run.repeat}`))].filter((key) =>
    modes.every((mode) => all.some((run) => `${run.task}|${run.repeat}` === key && run.mode === mode)),
  ),
);
const runs = all.filter((run) => complete.has(`${run.task}|${run.repeat}`));
const tasks = [...new Set(runs.map((run) => run.task))].sort();

const sum = (list, pick) => list.reduce((total, item) => total + pick(item), 0);

function summarize(list) {
  return {
    runs: list.length,
    passed: list.filter((run) => run.grade.passed).length,
    cost: sum(list, (run) => run.costUsd ?? 0),
    tokens: sum(list, (run) => run.tokens.totalTokens),
    output: sum(list, (run) => run.tokens.outputTokens),
    durationMs: sum(list, (run) => run.durationMs),
  };
}

const usd = (value) => `$${value.toFixed(2)}`;
const count = (value) => Math.round(value).toLocaleString('en-US');
const minutes = (ms) => `${(ms / 60000).toFixed(1)} min`;
const hours = (ms) => `${(ms / 3600000).toFixed(1)} h`;
const change = (value, base) => (base > 0 ? `${value >= base ? '+' : '−'}${Math.abs((value / base - 1) * 100).toFixed(0)}%` : 'n/a');

const versus = (mode, value, baseValue) => (mode === values.baseline ? '—' : change(value, baseValue));
const byMode = Object.fromEntries(modes.map((mode) => [mode, summarize(runs.filter((run) => run.mode === mode))]));
const base = byMode[values.baseline];

const lines = [];
lines.push(`Runs compared: ${runs.length} (${tasks.length} tasks × ${complete.size / tasks.length} repeats × ${modes.length} modes).`);
lines.push('');
lines.push(`| Mode | Passed | Cost | vs ${values.baseline} | Tokens | vs ${values.baseline} | Output tokens | Time | vs ${values.baseline} |`);
lines.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const mode of modes) {
  const s = byMode[mode];
  lines.push(
    `| ${mode} | ${s.passed}/${s.runs} | ${usd(s.cost)} | ${versus(mode, s.cost, base.cost)} | ${count(s.tokens)} | ${versus(mode, s.tokens, base.tokens)} | ${count(s.output)} | ${minutes(s.durationMs)} | ${versus(mode, s.durationMs, base.durationMs)} |`,
  );
}

lines.push('');
lines.push('Per task (mean per run):');
lines.push('');
lines.push(`| Task | ${modes.map((mode) => `${mode} cost | ${mode} time | ${mode} passed`).join(' | ')} |`);
lines.push(`| --- | ${modes.map(() => '--- | --- | ---').join(' | ')} |`);
for (const task of tasks) {
  const cells = modes.map((mode) => {
    const s = summarize(runs.filter((run) => run.task === task && run.mode === mode));
    return `${usd(s.cost / s.runs)} | ${minutes(s.durationMs / s.runs)} | ${s.passed}/${s.runs}`;
  });
  lines.push(`| ${task} | ${cells.join(' | ')} |`);
}

const scale = (Number(values.hours) * 3600000) / base.durationMs;
lines.push('');
lines.push(`The same work that keeps a ${values.baseline} session busy for ${values.hours} hours:`);
lines.push('');
lines.push('| Mode | Cost | Tokens | Agent time |');
lines.push('| --- | --- | --- | --- |');
for (const mode of modes) {
  const s = byMode[mode];
  lines.push(`| ${mode} | ${usd(s.cost * scale)} | ${count(s.tokens * scale)} | ${hours(s.durationMs * scale)} |`);
}

const report = `${lines.join('\n')}\n`;
writeFileSync(join(outDir, 'summary.md'), report);
console.log(report);
