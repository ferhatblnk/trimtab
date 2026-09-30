# trimtab benchmark

Runs the same coding tasks in three modes and compares cost, tokens, time, and correctness.

| Mode | Session effort | trimtab |
| --- | --- | --- |
| `xhigh` | xhigh | off |
| `medium` | medium | off |
| `trimtab` | medium | on |

## What it measures

Each task starts from a fresh copy of `fixture/`, a small invoicing and shipping library with its own tests. Claude Code runs the task headless (`claude -p`) with the same model, prompt, and tool permissions in every mode. User settings, user plugins, and MCP servers are left out so they can't skew the comparison.

After the run, a hidden test file from the task (`tasks/<task>/grade.test.js`) is copied in and the whole suite runs with the server clock in UTC. A run counts as passed only when every test passes. The change each run made is saved under `results/diffs/`.

Cost is Claude Code's `total_cost_usd`, the API list-price equivalent of every request in the session, subagents included. Tokens are the sum over all models of input, output, cache-read, and cache-write tokens.

## Tasks

| Task | Kind |
| --- | --- |
| `01-rename` | Mechanical rename across files |
| `02-currency` | Small feature with validation and an export column |
| `03-delivery` | Bug fix: business days and time zones |
| `04-invoice-tax` | Exact money arithmetic: half-even rounding, largest-remainder allocation |
| `05-shipping` | Several parts in one request: a calculation, a rename, an export column, docs |

`node validate-graders.mjs` checks each grader: it must fail on the untouched fixture and pass on the task's reference solution.

## Run it

```bash
node validate-graders.mjs
node run.mjs --repeats 2 --concurrency 3
node report.mjs
```

`run.mjs` uses `claude` from your `PATH`, or the binary in `CLAUDE_BIN`. It records each run in `results/runs.jsonl` and skips runs already recorded, so you can stop and resume it. Every run spends real usage from your Claude account; `--budget` caps the spend of a single run in USD (default 10).
