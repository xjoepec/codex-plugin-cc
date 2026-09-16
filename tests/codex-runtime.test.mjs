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
  renderSkills,
  splitOptionBoundary
} from "../plugins/codex/scripts/codex-runtime.mjs";
import { parseArgs } from "../plugins/codex/scripts/lib/args.mjs";

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
  assert.deepEqual(splitOptionBoundary(argv), {
    controls: ["--model", "real-model"],
    literal: ["explain", "--model", "literal-text"],
    hadBoundary: true
  });
});

test("missing runtime option values cannot consume the literal boundary", () => {
  assert.throws(
    () => removeOptions(["--skill", "--", "--write", "literal"], ["--skill"]),
    /Missing value for --skill/
  );
  assert.throws(
    () => readOption(["--model", "--", "--write", "literal"], ["--model", "-m"]),
    /Missing value for --model/
  );
  assert.throws(
    () => replaceOption(["--effort", "--", "--write"], ["--effort"], "--effort", "high"),
    /Missing value for --effort/
  );
});

test("shared argument parsing preserves the standard option boundary", () => {
  assert.throws(
    () =>
      parseArgs(["--model", "--", "--write", "literal"], {
        valueOptions: ["model"],
        booleanOptions: ["write"]
      }),
    /Missing value for --model/
  );
  assert.throws(
    () =>
      parseArgs(["-m", "--", "--write", "literal"], {
        valueOptions: ["model"],
        booleanOptions: ["write"],
        aliasMap: { m: "model" }
      }),
    /Missing value for -m/
  );
});

test("runtime strips private routing controls before forwarding", () => {
  const argv = ["--profile", "strong", "--skill", "openai-docs", "--skill=skill-creator", "fix", "it"];
  assert.deepEqual(removeOptions(argv, ["--profile", "--skill"]), ["fix", "it"]);
});

test("literal task flags remain literal while private controls are removed", () => {
  const argv = ["--profile", "strong", "--", "--write", "--resume", "--fresh", "--background"];
  assert.deepEqual(removeOptions(argv, ["--profile", "--skill"]), [
    "--",
    "--write",
    "--resume",
    "--fresh",
    "--background"
  ]);
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
