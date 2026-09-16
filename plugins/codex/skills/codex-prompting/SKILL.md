---
name: codex-prompting
description: Internal guidance for shaping concise, model-agnostic Codex delegation prompts.
user-invocable: false
---

# Codex Prompting

Preserve the user's task. Add only information that changes execution.

For implementation or debugging, make the objective, known evidence, scope boundary, verification, and done state explicit when they are not already clear.

For review or research, make the grounding rule and output contract explicit.

Do not restate repository context Codex can inspect itself. Do not prescribe a model or reasoning level unless the user did. Do not add generic coding advice.
