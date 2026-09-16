---
description: Inject a correction into a currently running Codex task without restarting it.
argument-hint: '[--job <job-id>] <instruction>'
disable-model-invocation: true
allowed-tools: Bash(node:*)
---

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-steer.mjs" "$ARGUMENTS"`
