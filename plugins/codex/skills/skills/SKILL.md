---
name: skills
description: Show the live Codex skill catalog for the current repository, including scope, enabled state, and owning plugin when available.
argument-hint: "[--reload] [--json]"
disable-model-invocation: true
allowed-tools: Bash(node:*)
---

Run `node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-runtime.mjs" skills "$ARGUMENTS"` and return stdout unchanged.
