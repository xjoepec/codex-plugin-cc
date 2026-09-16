---
name: database-migrate
description: Delegate schema evolution, backfills, indexes, type changes, migration ordering, rollback, or zero-downtime database work to Codex.
argument-hint: "<migration>"
context: fork
agent: codex:codex-rescue
background: false
---

Treat persisted data as an irreversible boundary until proven otherwise. Establish schema, read/write paths, deployment order, volume, lock/rewrite behavior, idempotency, and rollback constraints. Prefer additive staged migration for overlapping deploys. Stop before destructive production operations when recovery details are missing.

Task: $ARGUMENTS
