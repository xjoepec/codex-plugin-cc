---
name: orchestrate
description: Delegate a large task to Codex with parallel subagents when the work has independent low-overlap investigations or implementation slices.
argument-hint: "<multi-part task>"
context: fork
agent: codex:codex-rescue
background: false
---

Use Codex native subagents when the active runtime supports them and the task partitions cleanly. Give each worker a disjoint scope and one integrator ownership of shared decisions. Reconcile assumptions, inspect combined changes, then run broad validation. Avoid parallel writes to shared central files.

Task: $ARGUMENTS
