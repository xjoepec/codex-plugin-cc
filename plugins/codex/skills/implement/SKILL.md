---
name: implement
description: Delegate a substantial feature or repository change to Codex when the user wants implementation rather than advice.
argument-hint: "<feature or change>"
context: fork
agent: codex:codex-rescue
background: false
---

Implement the requested behavior with the smallest coherent patch. Inspect local conventions first, preserve unrelated behavior, and verify the changed path before finishing.

Task: $ARGUMENTS
