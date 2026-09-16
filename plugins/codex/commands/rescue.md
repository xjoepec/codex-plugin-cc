---
description: Delegate a task to Codex with optional model/profile, effort, skills, resume, and foreground/background controls.
argument-hint: '[--background|--wait] [--resume|--fresh] [--model <model>|--profile <max|strong|balanced|fast>] [--effort <value>] [--skill <name> ...] <task>'
allowed-tools: Bash(node:*), AskUserQuestion, Agent
---

Route the request with the `Agent` tool using `subagent_type: "codex:codex-rescue"`.

Preserve `--model`, `--profile`, `--effort`, and repeated `--skill` controls exactly. The runtime canonicalizes known frontier aliases and validates them against the installed Codex catalogs. Keep `--background` or `--wait` as Claude-side execution control.

If `--resume` is present, continue the latest task thread from this Claude session. If `--fresh` is present, start a new thread. Otherwise run `node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-companion.mjs" task-resume-candidate --json`; when a candidate exists, ask once whether to continue it or start fresh.

Run the subagent in the background when requested. Run it in the foreground when requested. Without an explicit execution choice, prefer foreground for a small bounded task and background for clearly long-running work.

Return Codex stdout unchanged. If Codex is unavailable or unauthenticated, direct the user to `/codex:setup`.
