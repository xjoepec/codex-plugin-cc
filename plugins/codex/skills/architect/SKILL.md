---
name: architect
description: Delegate repository-grounded architecture analysis or consequential technical design to Codex.
argument-hint: "<architecture question>"
context: fork
agent: codex:codex-rescue
background: false
---

Map the current boundaries, data flow, state ownership, failure domains, and deployment constraints before proposing change. Give a concrete design, migration path, rejected alternatives, failure modes, and a way to test the riskiest assumptions. Stay read-only unless implementation is explicitly requested.

Task: $ARGUMENTS
