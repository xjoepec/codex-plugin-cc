---
name: skill-create
description: Ask Codex to create or improve a reusable Codex skill from a recurring workflow or domain-specific procedure.
argument-hint: "<skill objective>"
context: fork
agent: codex:codex-rescue
background: false
---

Use `$skill-creator` when available. Keep the skill narrow, concise, triggerable from its description, and focused on procedural knowledge Codex would not reliably infer. Use progressive disclosure for references or scripts; avoid generic advice and decorative files.

Task: $ARGUMENTS
