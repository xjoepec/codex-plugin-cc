---
name: codex-cli-runtime
description: Internal contract for forwarding work from the codex-rescue subagent into the local Codex runtime.
user-invocable: false
---

# Codex Runtime

Use only inside `codex:codex-rescue`.

Invoke exactly one command:

`node "${CLAUDE_PLUGIN_ROOT}/scripts/codex-runtime.mjs" task "<raw arguments>"`

Rules:
- Forward one task and return stdout unchanged.
- Strip Claude-side `--background` and `--wait` routing flags before `task`.
- Preserve explicit `--model`, `--profile`, `--effort`, repeated `--skill`, `--resume`, and `--fresh` controls.
- Leave model/profile and effort unset by default. The runtime validates current model availability and reasoning support.
- Use `--resume-last` for `--resume`; omit it for `--fresh`.
- Default to `--write` unless the request is explicitly read-only.
- Prompt shaping with `codex-prompting` is the only Claude-side work allowed.
- Repository inspection, review/status/result/cancel/steer, job polling, and follow-up implementation remain outside this forwarding layer.
