---
name: release
description: Delegate release-readiness auditing or preparation to Codex before tags, packages, deployments, or publication.
argument-hint: "<release scope>"
context: fork
agent: codex:codex-rescue
background: false
---

Infer release requirements from repository metadata, prior releases, CI, packaging, and documented conventions. Check version consistency, changelog needs, generated artifacts, release gates, migration notes, compatibility, publishing assumptions, and package contents. Report blockers first.

Task: $ARGUMENTS
