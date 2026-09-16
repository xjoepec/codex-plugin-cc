---
name: agents-api
description: Delegate current OpenAI Agents API implementation, migration, or architecture work to Codex.
argument-hint: "<Agents API task>"
context: fork
agent: codex:codex-rescue
background: false
---

Use `$openai-docs` when available and inspect the repository before selecting APIs. Ground version-sensitive behavior in current official documentation. Treat tools, context, subagents, sandboxing, persistence, tracing, and evals as harness concerns that must match the requested system rather than generic boilerplate.

Task: $ARGUMENTS
