import assert from "node:assert/strict";
import test from "node:test";

import {
  injectSkillMentions,
  normalizeArgv,
  readOption,
  readOptions,
  removeOptions,
  replaceOption,
  renderModels,
  renderSkills
} from "../plugins/codex/scripts/codex-runtime.mjs";

test("runtime wrapper parses raw Claude Code argument strings", () => {
  const argv = normalizeArgv(['--model "deep model" --effort focused --skill openai-docs fix the bug']);
  assert.equal(readOption(argv, ["--model", "-m"]), "deep model");
  assert.equal(readOption(argv, ["--effort"]), "focused");
  assert.deepEqual(readOptions(argv, ["--skill"]), ["openai-docs"]);
});

test("runtime controls stop at the standard option boundary", () => {
  const argv = ["--model", "real-model", "--", "explain", "--model", "literal-text"];
  assert.equal(readOption(argv, ["--model", "-m"]), "real-model");
  assert.deepEqual(
    replaceOption(argv, ["--model", "-m"], "--model", "canonical-model"),
    ["--model", "canonical-model", "--", "explain", "--model", "literal-text"]
  );
});

test("runtime strips private routing controls before forwarding", () => {
  const argv = ["--profile", "strong", "--skill", "openai-docs", "--skill=skill-creator", "fix", "it"];
  assert.deepEqual(removeOptions(argv, ["--profile", "--skill"]), ["fix", "it"]);
});

test("validated skills become explicit Codex skill mentions", () => {
  assert.deepEqual(
    injectSkillMentions(["--write", "fix", "it"], [{ name: "openai-docs" }, { name: "skill-creator" }]),
    ["--write", "fix", "it", "$openai-docs", "$skill-creator"]
  );
  assert.deepEqual(
    injectSkillMentions(["--write", "--", "fix", "it"], [{ name: "openai-docs" }]),
    ["--write", "--", "$openai-docs", "fix", "it"]
  );
});

test("model renderer combines live capabilities with frontier policy annotations", () => {
  assert.match(
    renderModels([
      {
        model: "gpt-6-astra",
        isDefault: true,
        hidden: false,
        supportedReasoningEfforts: [{ reasoningEffort: "max" }],
        multiAgentVersion: "v2"
      }
    ]),
    /gpt-6-astra \[default\] \| effort=max \| multi-agent=v2 \| tier=max \| min-cli=0\.153\.0 \| aliases=astra/
  );
  assert.match(
    renderSkills([
      {
        cwd: "/repo",
        skills: [{ name: "openai-docs", scope: "system", enabled: true, pluginId: null }]
      }
    ]),
    /openai-docs \| system \| enabled/
  );
});
