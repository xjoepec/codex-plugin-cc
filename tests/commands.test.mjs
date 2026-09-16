import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN = path.join(ROOT, "plugins", "codex");

function read(relativePath) {
  return fs.readFileSync(path.join(PLUGIN, relativePath), "utf8");
}

function skillNames() {
  return fs
    .readdirSync(path.join(PLUGIN, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

const ENGINEERING_SKILLS = [
  "agents-api", "api-design", "architect", "benchmark", "ci", "database-migrate", "debug",
  "dependency-upgrade", "docs", "eval", "frontend", "implement", "incident", "openai-docs",
  "orchestrate", "performance", "plugin-create", "pr", "refactor", "release", "repo-map",
  "research", "security", "skill-create", "skill-install", "test"
].sort();

const FRONTIER_SKILLS = ["gpt-5-6", "gpt-6-astra", "model-routing"].sort();
const INTERNAL_SKILLS = ["codex-cli-runtime", "codex-prompting", "codex-result-handling", "models", "skills"];

test("legacy commands stay compatible and expose steering", () => {
  assert.deepEqual(
    fs.readdirSync(path.join(PLUGIN, "commands")).sort(),
    [
      "adversarial-review.md", "cancel.md", "rescue.md", "result.md", "review.md", "setup.md",
      "status.md", "steer.md", "transfer.md"
    ]
  );
});

test("rescue routes through one explicit subagent transport", () => {
  const source = read("commands/rescue.md");
  assert.match(source, /subagent_type: "codex:codex-rescue"/);
  assert.match(source, /--profile/);
  assert.match(source, /--skill/);
  assert.doesNotMatch(source, /^context:\s*fork\b/m);
});

test("rescue subagent stays a thin runtime forwarder", () => {
  const source = read("agents/codex-rescue.md");
  assert.match(source, /exactly one Bash/i);
  assert.match(source, /codex-cli-runtime/);
  assert.match(source, /codex-prompting/);
  assert.match(source, /Return Codex stdout.*unchanged/i);
  assert.match(source, /--profile/);
  assert.match(source, /--skill/);
});

test("engineering skill surface stays concise and task-specific", () => {
  const names = skillNames();
  assert.deepEqual(names, [...ENGINEERING_SKILLS, ...FRONTIER_SKILLS, ...INTERNAL_SKILLS].sort());

  for (const name of ENGINEERING_SKILLS) {
    const source = read(`skills/${name}/SKILL.md`);
    assert.match(source, /^context:\s*fork$/m, name);
    assert.match(source, /^agent:\s*codex:codex-rescue$/m, name);
    assert.match(source, /^background:\s*false$/m, name);
    assert.match(source, /Codex/i, name);
    assert.ok(source.length < 1900, `${name} should remain concise`);
  }
});

test("frontier model skills encode current routing without becoming catalogs", () => {
  const gpt56 = read("skills/gpt-5-6/SKILL.md");
  const astra = read("skills/gpt-6-astra/SKILL.md");
  const routing = read("skills/model-routing/SKILL.md");

  for (const source of [gpt56, astra, routing]) {
    assert.match(source, /^context:\s*fork$/m);
    assert.match(source, /^agent:\s*codex:codex-rescue$/m);
    assert.ok(source.length < 2200);
  }

  assert.match(gpt56, /gpt-5\.6-sol/);
  assert.match(gpt56, /gpt-5\.6-terra/);
  assert.match(gpt56, /gpt-5\.6-luna/);
  assert.match(astra, /gpt-6-astra/);
  assert.match(astra, /\/codex:steer/);
  assert.match(routing, /--profile/);
});

test("catalog skills are deterministic entrypoints", () => {
  for (const name of ["models", "skills"]) {
    const source = read(`skills/${name}/SKILL.md`);
    assert.match(source, /disable-model-invocation:\s*true/);
    assert.match(source, /codex-runtime\.mjs/);
  }
});

test("deterministic job-control commands stay model-free", () => {
  for (const name of ["transfer", "result", "cancel", "steer"]) {
    assert.match(read(`commands/${name}.md`), /disable-model-invocation:\s*true/);
  }
  assert.match(read("commands/steer.md"), /codex-steer\.mjs/);
});

test("background Codex job monitor is declared", () => {
  const source = read("monitors/monitors.json");
  assert.match(source, /codex-jobs/);
  assert.match(source, /codex-monitor\.mjs/);
});

test("session lifecycle and stop-gate hooks remain installed", () => {
  const source = read("hooks/hooks.json");
  assert.match(source, /SessionStart/);
  assert.match(source, /SessionEnd/);
  assert.match(source, /Stop/);
});
