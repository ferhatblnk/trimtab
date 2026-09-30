# Changelog

## 0.1.0

First release.

- Coordinator, scout, per-effort workers, and checker agents.
- Protocol loaded at session start; one-time reminder when the session runs above `medium` effort.
- Benchmark: five tasks, three modes, hidden-test grading. Against `xhigh`, trimtab cut cost by 36% and agent time by 51% with the same pass rate.

Known limitation: on the benchmark tasks the coordinator handled every request itself, so trimtab matched plain `medium` rather than beating it. The next release will route money, time zone, security, and data-deletion work to the scout regardless of size, and add harder benchmark tasks.
