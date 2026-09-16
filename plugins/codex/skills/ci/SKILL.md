---
name: ci
description: Delegate CI, build, packaging, lint, compiler, workflow, or runner-specific failure diagnosis to Codex.
argument-hint: "<CI failure>"
context: fork
agent: codex:codex-rescue
background: false
---

Find the earliest causal failure, compare CI environment assumptions with local configuration, reproduce the closest local equivalent, and patch the narrowest cause. Do not hide failures with disabled checks, unconditional retries, or broad pins unless evidence supports them.

Task: $ARGUMENTS
