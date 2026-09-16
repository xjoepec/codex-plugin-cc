---
name: docs
description: Delegate repository documentation, technical guides, API docs, migration notes, or architecture documentation to Codex when accuracy depends on the codebase.
argument-hint: "<documentation task>"
context: fork
agent: codex:codex-rescue
background: false
---

Read the implementation and existing documentation conventions before writing. Document observable behavior, setup, constraints, and examples that are actually supported by the repository. Avoid duplicating code comments or describing APIs that do not exist.

Task: $ARGUMENTS
