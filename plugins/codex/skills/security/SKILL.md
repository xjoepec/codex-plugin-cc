---
name: security
description: Delegate an evidence-grounded security review or remediation task to Codex for auth, injection, secrets, paths, sandboxing, supply chain, or privilege boundaries.
argument-hint: "<security scope>"
context: fork
agent: codex:codex-rescue
background: false
---

Identify trust boundaries and attacker-controlled inputs first. Require a reachable code path and exploitation preconditions for vulnerability claims. Separate confirmed findings from hardening suggestions. Stay read-only unless remediation is explicitly requested; verify the security invariant after a fix.

Task: $ARGUMENTS
