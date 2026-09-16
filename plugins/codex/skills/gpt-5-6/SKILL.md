---
name: gpt-5-6
description: Route Codex work to GPT-5.6 Sol, Terra, or Luna. Use when the user asks for GPT-5.6 or when capability, latency, or cost routing within the GPT-5.6 family matters.
argument-hint: "[sol|terra|luna] [--effort <value>] <task>"
context: fork
agent: codex:codex-rescue
background: false
---

Use one GPT-5.6 variant:
- `gpt-5.6-sol` (`gpt-5.6`, `sol`): complex professional coding, research, security, science, or long-horizon work.
- `gpt-5.6-terra` (`terra`): balanced intelligence and cost for ordinary engineering work.
- `gpt-5.6-luna` (`luna`): bounded, high-volume, latency- or cost-sensitive work.

Explicit variant wins. Without one, prefer Sol for substantial engineering, Terra when cost matters, and Luna only when throughput dominates. Pass the chosen model with `--model`. Preserve an explicit effort; otherwise leave effort unset. The runtime validates model availability, effort support, and the Codex CLI compatibility floor.
