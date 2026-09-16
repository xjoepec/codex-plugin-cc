---
name: repo-map
description: Ask Codex to build a high-signal mental model of an unfamiliar or large repository for a specific engineering objective.
argument-hint: "<what you need to understand>"
context: fork
agent: codex:codex-rescue
background: false
---

Map execution entry points, domain boundaries, configuration, persistence, external services, build/test commands, generated regions, and the files most relevant to the stated objective. Do not return a directory recital. Label unexplored regions in large repositories.

Task: $ARGUMENTS
