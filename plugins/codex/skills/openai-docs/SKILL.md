---
name: openai-docs
description: Ask Codex to answer a current OpenAI API, Codex, Agents API, model, SDK, or platform question using official OpenAI documentation.
argument-hint: "<OpenAI technical question>"
context: fork
agent: codex:codex-rescue
background: false
---

Use `$openai-docs` when available. Ground version-sensitive claims in current official OpenAI documentation and distinguish documented behavior from repository-specific inference.

Task: $ARGUMENTS
