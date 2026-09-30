# trimtab: Auto effort for Claude Code

Most Claude Code sessions run every step at the same effort. Pick `max` and a trivial step costs as much thinking as the hardest one. trimtab adds an **Auto** switch to the status bar: Claude Code studies each task, splits it into parts, and gives each part only the effort it needs.

> trimtab is an independent project. It is not affiliated with, endorsed by, or sponsored by Anthropic. Claude and Claude Code are trademarks of Anthropic, PBC.

## Use it

1. Install this extension. You need Claude Code, either the Claude Code extension or the `claude` command.
2. Click **trimtab** in the status bar. The first time, it asks to install the trimtab plugin for Claude Code from GitHub.
3. Start a new Claude Code session. The switch shows **trimtab: Auto** while it's on.

Click the switch again to turn Auto off. Your own effort level, such as `xhigh` or `max`, comes back as it was.

## What Auto does

While Auto is on:

- New sessions run at `medium` effort, and the main conversation acts as a coordinator. Questions and small edits are handled directly.
- Larger tasks go to a scout that reads the code at `xhigh` effort and splits the work into parts, each sized from `low` to `max`.
- Each part runs on a worker pinned at its effort. Parts where a mistake is costly, such as money, time zones, or security, run at `max` and are checked by an independent reviewer.

The switch changes two things in `~/.claude/settings.json`: it enables the `trimtab@trimtab` plugin and sets the saved effort levels to `medium`. It remembers your previous levels and puts them back when you turn Auto off. Sessions that are already open keep their current effort.

## Results so far

In our benchmark of five coding tasks, Auto cost 36% less than `xhigh` and took half the time, and every run passed the hidden tests. See [BENCHMARK.md](https://github.com/ferhatblnk/trimtab/blob/main/BENCHMARK.md) for the numbers and their limits.

## Privacy

trimtab makes no network requests of its own and collects no data. Installing the plugin runs `claude plugin marketplace add ferhatblnk/trimtab` and `claude plugin install trimtab@trimtab`, which download it from GitHub.

## License

MIT © 2026 Ferhat Talha Bulanık. Source: https://github.com/ferhatblnk/trimtab
