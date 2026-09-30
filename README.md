# trimtab

Automatic effort for Claude Code. trimtab studies a task at high effort, splits it into parts, and runs each part at the lowest effort that gets it right. Routine steps stay cheap, and deep reasoning is spent only where a mistake would cost you.

A trim tab is the small flap on a ship's rudder: a little force in the right place turns the whole ship.

> trimtab is an independent project. It is not affiliated with, endorsed by, or sponsored by Anthropic. Claude and Claude Code are trademarks of Anthropic, PBC.

## How it works

When trimtab is on, the main conversation acts as a coordinator:

1. **Triage.** Questions and small edits are answered directly. Nothing else happens.
2. **Scout.** Anything larger goes to the `scout` agent, which reads the code at `xhigh` effort and returns the parts of the work, an effort for each part, and the checks that prove it's done.
3. **Plan.** The coordinator shows the plan as a table: part, effort, why.
4. **Run.** Each part runs at its effort. `low` and `medium` parts are done in place or by a `low` worker; `high`, `xhigh`, and `max` parts go to workers pinned at that effort.
5. **Check.** Every `max` part is verified by an independent `checker` agent at `max` effort. If a part fails its check, it is retried once, one level up.

The scout sizes each part on this scale:

| Effort | Typical work |
| --- | --- |
| `low` | Renames, moving code, formatting, config, boilerplate that copies an example |
| `medium` | A standard feature or fix in a known pattern |
| `high` | Logic across several files, a bug with a clear reproduction |
| `xhigh` | Cross-layer changes, concurrency, caching, migrations, unclear bugs |
| `max` | Money and rounding, dates and time zones, security, deleting data, algorithms |

## Install

### VS Code

Install the **trimtab** extension, then click **trimtab** in the status bar. It installs the plugin on first use and gives you an **Auto** switch: on sets new sessions to `medium` effort and enables trimtab; off restores your own effort level. The extension lives in [`vscode/`](vscode/).

### Command line

```bash
claude plugin marketplace add ferhatblnk/trimtab
claude plugin install trimtab@trimtab
```

Or, inside a session: `/plugin install trimtab --marketplace ferhatblnk/trimtab`. Then run `/effort medium`.

**Set the session to `medium` effort.** The coordinator runs at your session's effort level, and trimtab raises effort only for the parts that need it. If the session stays at `xhigh`, every coordinator step is still paid at `xhigh`, and handing parts to workers adds cost on top. trimtab shows a one-time reminder when the session runs above `medium`.

## Turn it off

```bash
claude plugin disable trimtab@trimtab
```

Then set your usual effort again, for example `/effort xhigh`.

Or use the `/plugin` menu. While trimtab is disabled, Claude Code behaves exactly as before.

## Benchmark

We ran five coding tasks in three modes, twice each, and graded every result with hidden tests. All 30 runs passed.

| Mode | Cost | Agent time |
| --- | --- | --- |
| xhigh | $4.58 | 16.0 min |
| medium | $2.84 (−38%) | 7.6 min |
| trimtab | $2.91 (−36%) | 7.8 min |

Against `xhigh`, trimtab saved about a third of the cost and half the time. Against plain `medium` it saved nothing: these tasks were easy enough that the coordinator did them itself, so the saving came from the `medium` session effort. See [BENCHMARK.md](BENCHMARK.md) for the full numbers, the method, and how to reproduce them.

## What's in the plugin

| File | Purpose |
| --- | --- |
| `plugin/settings.json` | Makes `pilot` the main-conversation agent while trimtab is enabled |
| `plugin/agents/pilot.md` | The coordinator. Keeps Claude Code's own system prompt |
| `plugin/agents/scout.md` | Read-only analysis at `xhigh` effort |
| `plugin/agents/worker-*.md` | One worker per effort level |
| `plugin/agents/checker.md` | Read-only verification of `max` parts at `max` effort |
| `plugin/context/protocol.md` | The coordinator's instructions, loaded when a session starts |
| `plugin/hooks/` | Loads the protocol and shows the effort reminder |

trimtab makes no network requests and collects no data. Its hooks only print the protocol file and read the effort level of the current tool call.

## Limits

- **The session effort is yours to set.** Claude Code 2.1.284 applies an agent's `effort` to subagents but not to the main conversation, so trimtab can't lower the coordinator's effort by itself.
- **Small tasks don't get cheaper.** Every worker starts with an empty context. trimtab saves on larger, mixed tasks and handles small ones directly, so it stays close to plain `medium` there.
- **Your own `agent` setting wins.** If you already set `agent` in your settings, trimtab's coordinator isn't used.
- Tested with Claude Code 2.1.284 on macOS. The hooks need a POSIX shell (`sh`, `cat`, `sed`); on Windows, run Claude Code with Git Bash available.

## License

[MIT](LICENSE) © 2026 Ferhat Talha Bulanık
