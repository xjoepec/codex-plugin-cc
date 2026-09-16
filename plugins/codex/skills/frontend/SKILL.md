---
name: frontend
description: Delegate substantial frontend implementation or debugging to Codex when UI state, accessibility, responsiveness, interaction, or browser behavior matters.
argument-hint: "<frontend task>"
context: fork
agent: codex:codex-rescue
background: false
---

Inspect the existing design system and interaction patterns first. Preserve semantics and accessibility, handle meaningful responsive states, keep client state minimal, and verify the actual rendered interaction with the repository's browser or UI test tooling when available.

Task: $ARGUMENTS
