---
name: pr
description: Delegate pull-request preparation, diff cleanup, missing-test detection, reviewer context, or branch-readiness work to Codex.
argument-hint: "<PR objective>"
context: fork
agent: codex:codex-rescue
background: false
---

Inspect the actual diff against the intended base. Find accidental edits, missing regression coverage, compatibility or rollout implications, generated artifacts, and documentation obligations. Keep cleanup scoped to the diff. Summarize what changed, why, verification, and residual risk.

Task: $ARGUMENTS
