# Codex plugin for Claude Code

Use the local Codex runtime from Claude Code for review, delegated engineering work, current OpenAI-model routing, and task-specific Codex workflows.

## Install

```bash
/plugin marketplace add xjoepec/codex-plugin-cc
/plugin install codex@openai-codex
/reload-plugins
/codex:setup
```

Requirements: Node.js 18.18+ and a working Codex CLI login. The plugin reuses the local Codex installation, authentication, checkout, and `.codex/config.toml` you already use.

## Core commands

- `/codex:review` — native read-only review of working-tree or branch changes.
- `/codex:adversarial-review` — steerable read-only challenge review.
- `/codex:rescue` — delegate a free-form task to Codex.
- `/codex:steer` — inject a correction into a running Codex task without restarting it.
- `/codex:transfer` — import the current Claude Code session into a persistent Codex thread.
- `/codex:status`, `/codex:result`, `/codex:cancel` — manage delegated jobs.
- `/codex:setup` — check install/auth state and configure the optional stop-time review gate.

The legacy `commands/` entrypoints remain for compatibility. New workflow behavior lives in Claude Code Skills.

## Frontier model routing

The plugin combines explicit September 2026 model knowledge with live Codex capability discovery. Static policy supplies useful aliases, routing intent, and minimum CLI versions; `model/list` remains authoritative for actual availability and reasoning-effort support.

| Profile | Model | Use | Minimum Codex CLI |
| --- | --- | --- | --- |
| `max` | `gpt-6-astra` | hardest end-to-end reasoning, coding, research, computer use, multi-agent work | `0.153.0` |
| `strong` | `gpt-5.6-sol` | complex professional coding and research | `0.144.0` |
| `balanced` | `gpt-5.6-terra` | intelligence/cost balance | `0.144.0` |
| `fast` | `gpt-5.6-luna` | bounded high-volume or cost-sensitive work | `0.144.0` |

Convenience aliases: `astra`, `sol`, `terra`, `luna`. The official `gpt-5.6` alias resolves to Sol.

```text
/codex:gpt-6-astra --effort high redesign the scheduler and verify the migration
/codex:gpt-5-6 terra implement the API client and tests
/codex:model-routing balanced clean up these five independent handlers

/codex:rescue --model astra --effort xhigh ...
/codex:rescue --profile strong ...
```

Astra does not support `none` reasoning. The plugin does not maintain a second effort table; it validates explicit effort against the model advertised by the installed Codex runtime.

## Live runtime catalogs

```bash
/codex:models
/codex:models --all
/codex:skills
/codex:skills --reload
```

`/codex:models` reads app-server `model/list`, including default status, supported reasoning efforts, hidden status, multi-agent capability, plus policy annotations for Astra and GPT-5.6.

`/codex:skills` reads `skills/list` for the current repository and shows scope, enabled state, and plugin ownership.

Raw delegation can load current Codex skills by name:

```text
/codex:rescue --skill openai-docs --skill skill-creator build a migration skill
```

The runtime verifies each requested skill against `skills/list`, strips the routing flags, and adds explicit `$skill-name` mentions to the Codex task so the installed Codex skill system loads them.

## Task-specific skills

Engineering workflows:

`/codex:debug`, `/codex:implement`, `/codex:refactor`, `/codex:architect`,
`/codex:orchestrate`, `/codex:research`, `/codex:security`,
`/codex:performance`, `/codex:test`, `/codex:ci`, `/codex:repo-map`,
`/codex:dependency-upgrade`, `/codex:database-migrate`, `/codex:release`,
`/codex:pr`, `/codex:frontend`, `/codex:api-design`, `/codex:incident`,
`/codex:docs`, `/codex:benchmark`, and `/codex:eval`.

Model-aware workflows:

- `/codex:gpt-6-astra` — Astra-specific delegation.
- `/codex:gpt-5-6` — Sol/Terra/Luna family routing.
- `/codex:model-routing` — capability/cost/latency profile routing.
- `/codex:models` — deterministic live catalog inspection.

Current Codex ecosystem bridges:

- `/codex:agents-api` — current OpenAI Agents API work through Codex.
- `/codex:openai-docs` — current OpenAI documentation through Codex.
- `/codex:skill-create` — create or improve Codex skills with `$skill-creator`.
- `/codex:skill-install` — discover or install Codex skills with `$skill-installer`.
- `/codex:plugin-create` — create or modernize Codex plugins with `$plugin-creator`.

Skills stay intentionally small. Codex already knows how to code; the plugin supplies routing, scope, current model semantics, and procedural constraints that materially change execution.

## Mid-turn steering

For a running task:

```text
/codex:status
/codex:steer --job task-abc123 keep the public API unchanged and use the existing cache
```

If exactly one Codex task is running in the current Claude session, the job ID can be omitted:

```text
/codex:steer stop touching the parser; isolate the fix to the serializer
```

Steering uses app-server `turn/steer` with the tracked thread and turn IDs. It preserves completed work instead of cancelling and starting a replacement task. Review and compaction turns can reject steering because Codex marks those turn kinds non-steerable.

## Review flows

`/codex:review` maps directly to Codex's native reviewer and remains read-only.

```bash
/codex:review
/codex:review --base main
/codex:review --background
```

Use `/codex:adversarial-review` when the review needs custom focus text:

```bash
/codex:adversarial-review --base main challenge the retry and rollback design
```

Review output is never auto-applied.

## Background jobs

Claude Code starts the plugin job monitor in interactive sessions. It watches the local Codex job store and emits a notification when a newly observed task completes, fails, or is cancelled. Manual status commands remain available.

```text
/codex:rescue --background investigate the regression
/codex:status
/codex:steer tighten the fix to the failing package only
/codex:result
/codex:cancel
```

`/codex:transfer` moves the current Claude Code session into Codex and returns a `codex resume <session-id>` command.

## Stop-time review gate

```bash
/codex:setup --enable-review-gate
/codex:setup --disable-review-gate
```

The gate uses a Claude Code `Stop` hook to request a focused Codex review before the session stops. It can consume significant model usage on long edit loops, so enable it deliberately.

## Development

```bash
npm test
npm run check-version
npm run build
npm run plugin:validate
npm run plugin:eval
```

`plugin:eval` uses Claude Code's plugin eval runner. The checked-in suite measures task, model-specific, orchestration, and negative routing behavior. It remains separate from deterministic Node tests because eval runs consume model usage.

The TypeScript check regenerates current Codex app-server types before checking the JS integration layer. The background monitor is declarative under `monitors/monitors.json` and requires a Claude Code release with plugin-monitor support.

## Design rules

1. Query live runtime capability when Codex exposes it.
2. Encode current model-family semantics when they materially change routing or execution.
3. Keep skills narrow; avoid generic coding sermons.
4. Preserve explicit model choices and never silently downgrade them.
5. Test routing and executable invariants rather than paragraphs of prose.

## License

Apache-2.0
