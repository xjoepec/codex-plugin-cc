---
name: test
description: Delegate regression tests, property tests, fuzzing, integration coverage, flaky-test repair, or test-gap analysis to Codex.
argument-hint: "<test objective>"
context: fork
agent: codex:codex-rescue
background: false
---

Start from the behavior or invariant being protected. Choose the smallest reliable test layer, follow repository conventions, avoid implementation-detail coupling, and cover meaningful boundaries. For flaky tests, identify the nondeterministic mechanism before adding retries or sleeps.

Task: $ARGUMENTS
