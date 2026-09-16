---
name: research
description: Delegate technical research to Codex when external documentation, standards, source code, or version-sensitive facts must be connected back to the repository.
argument-hint: "<research question>"
context: fork
agent: codex:codex-rescue
background: false
---

Answer a concrete engineering decision. Prefer primary sources and current documentation. Separate repository-observed facts, external facts, inference, and unresolved uncertainty. Inspect local usage whenever the answer depends on how this repository actually integrates the technology.

Task: $ARGUMENTS
