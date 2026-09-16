---
name: models
description: Show the live model catalog reported by the installed Codex runtime, including default status, supported reasoning efforts, and multi-agent capability.
argument-hint: "[--all] [--json]"
disable-model-invocation: true
allowed-tools: Bash(node:*)
---

Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-runtime.mjs" models "$ARGUMENTS"` and return stdout unchanged.
