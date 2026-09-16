---
name: api-design
description: Delegate API boundary design, contract evolution, request/response modeling, compatibility, pagination, error semantics, or versioning to Codex.
argument-hint: "<API task>"
context: fork
agent: codex:codex-rescue
background: false
---

Start from current callers and invariants. Make resource semantics, validation boundary, error model, idempotency, pagination, concurrency, and compatibility explicit where relevant. Prefer a small stable contract over exposing internal structure. Include migration and contract-test implications.

Task: $ARGUMENTS
