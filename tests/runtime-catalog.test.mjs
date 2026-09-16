import assert from "node:assert/strict";
import test from "node:test";

import { resolveModelSelection, resolveSkillSelection } from "../plugins/codex/scripts/lib/runtime-catalog.mjs";
import {
  assertModelCliVersion,
  canonicalModel,
  compareVersions,
  modelForProfile,
  parseVersion
} from "../plugins/codex/scripts/lib/model-policy.mjs";

const models = [
  {
    id: "astra-id",
    model: "gpt-6-astra",
    isDefault: false,
    supportedReasoningEfforts: [
      { reasoningEffort: "low", description: "Low" },
      { reasoningEffort: "max", description: "Maximum" }
    ]
  },
  {
    id: "sol-id",
    model: "gpt-5.6-sol",
    isDefault: true,
    supportedReasoningEfforts: [
      { reasoningEffort: "none", description: "None" },
      { reasoningEffort: "high", description: "High" }
    ]
  }
];

test("frontier aliases and profiles resolve to canonical model IDs", () => {
  assert.equal(canonicalModel("astra"), "gpt-6-astra");
  assert.equal(canonicalModel("gpt-5.6"), "gpt-5.6-sol");
  assert.equal(canonicalModel("terra"), "gpt-5.6-terra");
  assert.equal(modelForProfile("max"), "gpt-6-astra");
  assert.equal(modelForProfile("balanced"), "gpt-5.6-terra");
  assert.throws(() => modelForProfile("mystery"), /Unknown model profile/);
});

test("model selection uses aliases but live effort support remains authoritative", () => {
  assert.deepEqual(resolveModelSelection(models, { model: "astra", effort: "max" }), {
    model: "gpt-6-astra",
    effort: "max"
  });
  assert.deepEqual(resolveModelSelection(models, { effort: "high" }), {
    model: null,
    effort: "high"
  });
  assert.throws(
    () => resolveModelSelection(models, { model: "astra", effort: "none" }),
    /not supported by gpt-6-astra/
  );
});

test("canonical policies accept equivalent live model aliases", () => {
  const aliasCatalog = [
    {
      id: "sol-alias",
      model: "gpt-5.6",
      isDefault: true,
      supportedReasoningEfforts: [{ reasoningEffort: "high", description: "High" }]
    }
  ];
  assert.deepEqual(resolveModelSelection(aliasCatalog, { model: "sol", effort: "high" }), {
    model: "gpt-5.6",
    effort: "high"
  });
});

test("known frontier models report precise CLI compatibility floors", () => {
  assert.deepEqual(parseVersion("codex-cli 0.153.2"), [0, 153, 2]);
  assert.equal(compareVersions("0.153.0", "0.144.0"), 1);
  assert.doesNotThrow(() => assertModelCliVersion("astra", "codex-cli 0.153.0"));
  assert.throws(() => assertModelCliVersion("astra", "codex-cli 0.152.9"), /requires Codex CLI 0\.153\.0/);
  assert.throws(() => assertModelCliVersion("sol", "codex-cli 0.143.9"), /requires Codex CLI 0\.144\.0/);
  assert.doesNotThrow(() => assertModelCliVersion("astra", "custom-codex-build"));
});

test("skill selection resolves enabled skills and preserves requested order", () => {
  const entries = [
    {
      cwd: "/repo",
      skills: [
        { name: "openai-docs", enabled: true, path: "/skills/openai-docs/SKILL.md" },
        { name: "disabled", enabled: false, path: "/skills/disabled/SKILL.md" },
        { name: "skill-creator", enabled: true, path: "/skills/skill-creator/SKILL.md" }
      ],
      errors: []
    }
  ];

  assert.deepEqual(
    resolveSkillSelection(entries, ["skill-creator", "openai-docs"]).map((skill) => skill.name),
    ["skill-creator", "openai-docs"]
  );
  assert.throws(() => resolveSkillSelection(entries, ["disabled"]), /not available/);
});

test("skill discovery errors remain visible when a requested skill cannot resolve", () => {
  const entries = [
    {
      cwd: "/repo",
      skills: [],
      errors: [{ message: "Invalid SKILL.md frontmatter" }]
    }
  ];

  assert.throws(
    () => resolveSkillSelection(entries, ["broken-skill"]),
    /Skill discovery reported: Invalid SKILL\.md frontmatter/
  );
});
