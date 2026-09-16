---
name: incident
description: Delegate production-incident investigation, regression localization, mitigation analysis, or post-incident engineering work to Codex.
argument-hint: "<incident evidence>"
context: fork
agent: codex:codex-rescue
background: false
---

Build a timestamped evidence chain from logs, deploys, config, metrics, and code changes. Separate confirmed facts from hypotheses. Prefer reversible mitigation before broad repair when service restoration is the goal. Identify root cause, blast radius, verification, and follow-up controls without inventing telemetry.

Task: $ARGUMENTS
