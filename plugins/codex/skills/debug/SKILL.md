---
name: debug
description: Delegate a difficult bug, regression, crash, race, flaky failure, or unclear root cause to Codex for evidence-first diagnosis and a minimal verified fix.
argument-hint: "<bug or failure>"
context: fork
agent: codex:codex-rescue
background: false
---

Diagnose before editing. Reproduce or establish the failure from repository evidence, trace the causal path, make the smallest defensible fix, add a regression test when useful, and run targeted verification.

Task: $ARGUMENTS
