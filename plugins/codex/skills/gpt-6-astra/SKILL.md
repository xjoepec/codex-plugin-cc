---
name: gpt-6-astra
description: Delegate the hardest end-to-end Codex work to GPT-6 Astra. Use for explicit Astra/GPT-6 requests or exceptionally difficult coding, research, computer-use, architecture, and multi-agent tasks.
argument-hint: "[--effort low|medium|high|xhigh|max] <task>"
context: fork
agent: codex:codex-rescue
background: false
---

Route with `--model gpt-6-astra`.

Astra is appropriate when the task benefits from maximum reasoning quality, long-horizon execution, computer use, research, or multi-agent delegation. For genuinely separable work, explicitly ask Astra to delegate independent investigations and reconcile them before final verification. Do not spend Astra on routine mechanical edits when GPT-5.6 is adequate.

Preserve explicit effort. Never translate `none` or `minimal` into an Astra request; Astra's live catalog must validate the effort. Leave effort unset when the user did not choose one. For a correction to an already-running task, use `/codex:steer` instead of discarding completed work and launching a replacement run.
