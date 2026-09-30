# Benchmark

Five coding tasks, three modes, two runs each: 30 Claude Code sessions, every result graded by hidden tests.

## Results

| Mode | Passed | Cost | vs xhigh | Tokens | vs xhigh | Output tokens | Agent time | vs xhigh |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| xhigh | 10/10 | $4.58 | — | 3,759,264 | — | 107,342 | 16.0 min | — |
| medium | 10/10 | $2.84 | −38% | 2,225,473 | −41% | 54,223 | 7.6 min | −52% |
| trimtab | 10/10 | $2.91 | −36% | 2,352,500 | −37% | 54,877 | 7.8 min | −51% |

Every run in every mode passed every hidden test.

### Per task

Mean of two runs.

| Task | xhigh | medium | trimtab |
| --- | --- | --- | --- |
| `01-rename` | $0.17, 0.4 min | $0.17, 0.4 min | $0.17, 0.4 min |
| `02-currency` | $0.28, 0.8 min | $0.29, 0.7 min | $0.31, 0.8 min |
| `03-delivery` | $0.48, 1.8 min | $0.25, 0.7 min | $0.23, 0.6 min |
| `04-invoice-tax` | $0.80, 3.2 min | $0.31, 0.9 min | $0.34, 1.0 min |
| `05-shipping` | $0.56, 1.9 min | $0.40, 1.1 min | $0.41, 1.1 min |

### Over a five-hour session

Scaled to the same work that keeps an `xhigh` session busy for five hours of agent time:

| Mode | Cost | Tokens | Agent time |
| --- | --- | --- | --- |
| xhigh | $85.76 | 70.3 million | 5.0 h |
| medium | $53.09 | 41.6 million | 2.4 h |
| trimtab | $54.53 | 44.0 million | 2.4 h |

On this task mix, trimtab does the work of a five-hour `xhigh` session for 36% less, in about half the time.

## What the numbers say

- **Against `xhigh`, trimtab saves about a third.** Cost fell 36%, tokens 37%, and agent time 51%, with the same pass rate. The biggest gains came on the tasks where `xhigh` thinks longest: the time-zone bug (−52% cost) and the money arithmetic (−58%).
- **Against plain `medium`, trimtab adds no saving.** It cost 2.7% more. On these tasks the coordinator judged every request small enough to do itself: in a diagnostic rerun of the money and shipping tasks with agent calls logged, it started no scout, worker, or checker. So the saving here comes from running at `medium` effort, and trimtab's own contribution is a small cost for its instructions.
- **These tasks didn't need more than `medium`.** Plain `medium` passed all of them, so this benchmark can't show whether trimtab's high-effort analysis and `max` checks prevent mistakes that `medium` would make. That needs harder tasks, where `medium` fails some of the time.

## Method

- **Model:** `claude-opus-5-5` in every mode, Claude Code 2.1.284, headless (`claude -p`).
- **Modes:** `xhigh` is the session at `xhigh` effort. `medium` is the session at `medium` effort. `trimtab` is the session at `medium` effort with the trimtab plugin loaded.
- **Isolation:** user settings, user plugins, and MCP servers were left out (`--setting-sources project,local`, `--strict-mcp-config`), and every mode got the same prompt and tool permissions.
- **Project:** each run started from a fresh copy of `benchmark/fixture`, a small invoicing and shipping library in plain JavaScript with its own tests.
- **Grading:** after each run, the task's hidden test file was added and the whole suite ran with the server clock in UTC. Before the benchmark, every grader was checked to fail on the untouched project and pass on a reference solution.
- **Cost:** Claude Code's `total_cost_usd`, the API list-price equivalent of every request in the session, subagents included. On a subscription plan, usage counts against your limits rather than a bill.
- **Tokens:** input, output, cache-read, and cache-write tokens over all models in the session.
- **Five-hour projection:** each mode's totals multiplied by the factor that turns the `xhigh` agent time into five hours.

| Task | What it asks for |
| --- | --- |
| `01-rename` | Rename a function across source and tests |
| `02-currency` | Add a validated field and an export column |
| `03-delivery` | Fix a delivery-date bug involving business days and time zones |
| `04-invoice-tax` | Exact money arithmetic: half-even rounding and largest-remainder allocation |
| `05-shipping` | Five changes in one request: a calculation, a rename, an export column, and docs |

## Limits

- Five tasks in one small repository, two runs each. The numbers show direction, not a guarantee; your savings depend on your work and your usual effort level.
- One model. Other models and effort defaults will give different numbers.
- Agent time is the time Claude Code spent on the tasks, not the length of a working session with a person in it.

## Reproduce

```bash
cd benchmark
node validate-graders.mjs
node run.mjs --repeats 2 --concurrency 3
node report.mjs
```

Raw results are in `benchmark/results/runs.jsonl`, and the change each run made is in `benchmark/results/diffs/`. See [benchmark/README.md](benchmark/README.md) for the details.
