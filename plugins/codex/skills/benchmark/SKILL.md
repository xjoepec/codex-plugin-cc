---
name: benchmark
description: Delegate benchmark design, measurement, regression analysis, or performance-comparison work to Codex.
argument-hint: "<benchmark objective>"
context: fork
agent: codex:codex-rescue
background: false
---

Define workload, environment, warmup, repetitions, metric, and correctness invariant before comparing implementations. Control obvious confounders, report distributions when useful, keep raw measurement reproducible, and avoid claiming significance the data cannot support.

Task: $ARGUMENTS
