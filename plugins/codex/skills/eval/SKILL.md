---
name: eval
description: Delegate AI-system, agent, prompt, tool-use, or coding-agent evaluation design and implementation to Codex.
argument-hint: "<evaluation objective>"
context: fork
agent: codex:codex-rescue
background: false
---

Define the behavior being measured, realistic task distribution, deterministic checks where possible, judge criteria where necessary, baseline, variance, contamination risks, and failure taxonomy. Prefer evals that distinguish genuine capability from brittle prompt or fixture exploitation.

Task: $ARGUMENTS
