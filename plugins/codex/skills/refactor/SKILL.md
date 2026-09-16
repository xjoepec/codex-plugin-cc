---
name: refactor
description: Delegate behavior-preserving structural cleanup, decomposition, boundary repair, duplication removal, or dead-code removal to Codex.
argument-hint: "<refactor>"
context: fork
agent: codex:codex-rescue
background: false
---

Establish observable invariants before changing structure. Keep behavior changes out of the refactor unless explicitly requested. Inspect callers, tests, public interfaces, persisted formats, and generated regions; verify equivalence afterward.

Task: $ARGUMENTS
