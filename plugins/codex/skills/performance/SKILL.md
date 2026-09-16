---
name: performance
description: Delegate latency, throughput, CPU, memory, allocation, I/O, startup, query, build-time, or scalability investigation to Codex.
argument-hint: "<performance problem>"
context: fork
agent: codex:codex-rescue
background: false
---

Measure before optimizing. Establish the workload and baseline, identify the dominant cost center, change code only when the mechanism plausibly addresses it, then quantify the result. If reliable measurement is impossible, produce a reproducible benchmark or profiling plan instead of a speedup claim.

Task: $ARGUMENTS
