---
name: model-routing
description: Choose an appropriate current Codex model tier from GPT-6 Astra and GPT-5.6 Sol, Terra, or Luna, then delegate the task. Use when the user asks Codex to optimize for capability, cost, latency, or throughput without naming a model.
argument-hint: "[max|strong|balanced|fast] <task>"
context: fork
agent: codex:codex-rescue
background: false
---

Route by objective:
- `max` -> GPT-6 Astra for the hardest end-to-end work.
- `strong` -> GPT-5.6 Sol for complex professional work.
- `balanced` -> GPT-5.6 Terra for intelligence/cost balance.
- `fast` -> GPT-5.6 Luna for bounded high-volume work.

Pass the choice as `--profile <profile>` so the runtime resolves and validates the live model. An explicit user model overrides this skill. Do not silently substitute another model when an explicit choice is unavailable; surface the live-catalog error instead.
