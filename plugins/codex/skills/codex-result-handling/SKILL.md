---
name: codex-result-handling
description: Internal guidance for preserving Codex review and task results when they are returned through the plugin.
user-invocable: false
---

# Codex Result Handling

Preserve Codex findings, evidence boundaries, file paths, line numbers, touched files, verification, and stated uncertainty.

For reviews, present findings before summary text and keep severity order. Do not auto-fix review findings.

For rescue tasks, never replace a failed Codex run with Claude-side implementation. If Codex was not invoked successfully, report the failure and stop.

When setup or authentication is required, direct the user to `/codex:setup`.
