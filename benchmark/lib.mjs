import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const BENCHMARK_DIR = dirname(fileURLToPath(import.meta.url));
export const FIXTURE_DIR = join(BENCHMARK_DIR, 'fixture');
export const TASKS_DIR = join(BENCHMARK_DIR, 'tasks');
export const GRADE_FILE = 'test/zz-grade.test.js';
export const SERVER_TIME_ZONE = 'UTC';

export function listTasks() {
  return readdirSync(TASKS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function taskPrompt(task) {
  return `${readFileSync(join(TASKS_DIR, task, 'prompt.md'), 'utf8').trim()}\n\nWhen you're done, \`node --test\` must pass.`;
}

export function prepareWorkdir(label) {
  const dir = mkdtempSync(join(tmpdir(), `trimtab-${label}-`));
  cpSync(FIXTURE_DIR, dir, { recursive: true });
  const git = (...args) => execFileSync('git', args, { cwd: dir, stdio: 'ignore' });
  git('init', '-q');
  git('add', '-A');
  git('-c', 'user.name=trimtab-bench', '-c', 'user.email=bench@trimtab.invalid', 'commit', '-qm', 'fixture');
  return dir;
}

export function applyReference(task, dir) {
  const reference = join(TASKS_DIR, task, 'reference');
  if (existsSync(reference)) {
    cpSync(reference, dir, { recursive: true });
  }
}

export function grade(task, dir) {
  cpSync(join(TASKS_DIR, task, 'grade.test.js'), join(dir, GRADE_FILE));
  const run = spawnSync('node', ['--test', '--test-reporter=tap'], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, TZ: SERVER_TIME_ZONE },
    timeout: 120_000,
  });
  const count = (name) => Number((run.stdout.match(new RegExp(`^# ${name} (\\d+)$`, 'm')) ?? [])[1] ?? 0);
  return { pass: count('pass'), fail: count('fail'), passed: count('fail') === 0 && count('pass') > 0 };
}
