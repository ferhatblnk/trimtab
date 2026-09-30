import { rmSync } from 'node:fs';
import { applyReference, grade, listTasks, prepareWorkdir } from './lib.mjs';

let ok = true;
for (const task of listTasks()) {
  const before = prepareWorkdir(`check-${task}`);
  const untouched = grade(task, before);
  const after = prepareWorkdir(`check-${task}`);
  applyReference(task, after);
  const solved = grade(task, after);
  const valid = !untouched.passed && solved.passed;
  ok &&= valid;
  console.log(
    `${valid ? 'OK  ' : 'FAIL'} ${task}: fixture ${untouched.pass} pass / ${untouched.fail} fail, reference ${solved.pass} pass / ${solved.fail} fail`,
  );
  rmSync(before, { recursive: true, force: true });
  rmSync(after, { recursive: true, force: true });
}
process.exit(ok ? 0 : 1);
