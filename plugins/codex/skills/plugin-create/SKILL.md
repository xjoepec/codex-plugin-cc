---
name: plugin-create
description: Ask Codex to create, audit, or modernize a Codex plugin using the current plugin format and runtime capabilities.
argument-hint: "<plugin objective>"
context: fork
agent: codex:codex-rescue
background: false
---

Use `$plugin-creator` when available. Inspect current plugin conventions and runtime capability instead of copying stale scaffolding. Keep commands, skills, tools, configuration, tests, and distribution metadata minimal and purpose-driven.

Task: $ARGUMENTS
