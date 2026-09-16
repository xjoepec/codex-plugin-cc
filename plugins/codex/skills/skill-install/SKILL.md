---
name: skill-install
description: Ask Codex to discover or install reusable Codex skills from supported catalogs or repositories.
argument-hint: "<skill to find or install>"
context: fork
agent: codex:codex-rescue
background: false
---

Use `$skill-installer` when available. Inspect the live skill catalog first when that can avoid duplicate installation. Prefer the smallest relevant skill set and report source, scope, and restart or reload requirements.

Task: $ARGUMENTS
