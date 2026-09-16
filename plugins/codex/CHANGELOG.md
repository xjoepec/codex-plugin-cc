# Changelog

## 1.2.0

- Add first-class GPT-6 Astra and GPT-5.6 Sol/Terra/Luna routing skills.
- Add frontier model aliases, capability profiles, and precise Codex CLI compatibility floors while keeping live `model/list` authoritative.
- Add `/codex:steer` over app-server `turn/steer` for mid-turn corrections to running delegated tasks.
- Make repeated `--skill` controls functional by validating against `skills/list` and forwarding explicit Codex skill mentions.
- Annotate `/codex:models` with current frontier routing policy without duplicating the live effort catalog.
- Add a Claude Code background monitor that surfaces new Codex job completion, failure, and cancellation transitions.
- Add deterministic tests and Claude plugin eval cases for Astra and GPT-5.6 routing.

## 1.1.0

- Add 26 concise task-specific Claude Code Skills for Codex delegation.
- Add live Codex model and skill catalog inspection through app-server `model/list` and `skills/list`.
- Validate explicit delegated-task model and reasoning-effort selections against the live runtime before execution.
- Replace the version-named prompting skill with model-agnostic `codex-prompting`.
- Add current Codex ecosystem bridges for OpenAI docs, Agents API, skill creation/installation, and plugin creation.
- Add Claude Code plugin routing evals and replace brittle prose-regex tests with structural invariants.
- Keep the existing slash-command surface as a compatibility layer.

## 1.0.0

- Initial version of the Codex plugin for Claude Code.
