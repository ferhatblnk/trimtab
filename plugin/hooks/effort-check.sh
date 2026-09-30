#!/bin/sh
input=$(cat)

case "$input" in
  *'"agent_type":"trimtab:pilot"'*) ;;
  *) exit 0 ;;
esac

level=$(printf '%s' "$input" | sed -n 's/.*"effort":{"level":"\([a-z]*\)"}.*/\1/p')
case "$level" in
  high|xhigh|max) ;;
  *) exit 0 ;;
esac

session=$(printf '%s' "$input" | sed -n 's/.*"session_id":"\([A-Za-z0-9_-]*\)".*/\1/p')
marker="${CLAUDE_PLUGIN_DATA:-${TMPDIR:-/tmp}}/effort-warned-${session:-unknown}"
[ -e "$marker" ] && exit 0
mkdir -p "$(dirname "$marker")" && : > "$marker"

printf '{"systemMessage":"trimtab: this session runs at %s effort, so every coordinator step is paid at that level. Run /effort medium and trimtab raises effort only for the parts that need it."}\n' "$level"
