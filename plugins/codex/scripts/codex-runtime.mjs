#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { splitRawArgumentString } from "./lib/args.mjs";
import { describeModelPolicy } from "./lib/model-policy.mjs";
import { listCodexModels, listCodexSkills, resolveTaskRuntime } from "./lib/runtime-catalog.mjs";

const ROOT_DIR = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const COMPANION = path.join(ROOT_DIR, "scripts", "codex-companion.mjs");

function normalizeArgv(argv) {
  if (argv.length !== 1) return argv;
  const [raw] = argv;
  return raw?.trim() ? splitRawArgumentString(raw) : [];
}

// Security invariant: tokens after `--` are literal task input.
// No runtime routing helper may remove the boundary or reinterpret its suffix.
function splitOptionBoundary(tokens) {
  const boundary = tokens.indexOf("--");
  if (boundary === -1) {
    return { controls: [...tokens], literal: [], hadBoundary: false };
  }
  return {
    controls: tokens.slice(0, boundary),
    literal: tokens.slice(boundary + 1),
    hadBoundary: true
  };
}

function joinOptionBoundary(controls, literal, hadBoundary) {
  return hadBoundary ? [...controls, "--", ...literal] : [...controls];
}

function missingOptionValue(name) {
  return new Error(`Missing value for ${name}`);
}

function readOptions(tokens, names) {
  const { controls } = splitOptionBoundary(tokens);
  const values = [];

  for (let index = 0; index < controls.length; index += 1) {
    const token = controls[index];
    for (const name of names) {
      if (token === name) {
        if (index + 1 >= controls.length) throw missingOptionValue(name);
        values.push(controls[index + 1]);
        index += 1;
        break;
      }
      const prefix = `${name}=`;
      if (token.startsWith(prefix)) {
        values.push(token.slice(prefix.length));
        break;
      }
    }
  }
  return values;
}

function readOption(tokens, names) {
  return readOptions(tokens, names).at(-1) ?? null;
}

function hasFlag(tokens, name) {
  const { controls } = splitOptionBoundary(tokens);
  return controls.some((token) => token === name || token === `${name}=true`);
}

function replaceOption(tokens, names, canonicalName, value) {
  if (value == null) return [...tokens];

  const { controls, literal, hadBoundary } = splitOptionBoundary(tokens);
  for (let index = controls.length - 1; index >= 0; index -= 1) {
    for (const name of names) {
      if (controls[index] === name) {
        if (index + 1 >= controls.length) throw missingOptionValue(name);
        controls[index] = canonicalName;
        controls[index + 1] = value;
        return joinOptionBoundary(controls, literal, hadBoundary);
      }
      const prefix = `${name}=`;
      if (controls[index].startsWith(prefix)) {
        controls[index] = `${canonicalName}=${value}`;
        return joinOptionBoundary(controls, literal, hadBoundary);
      }
    }
  }

  controls.push(canonicalName, value);
  return joinOptionBoundary(controls, literal, hadBoundary);
}

function removeOptions(tokens, names) {
  const { controls, literal, hadBoundary } = splitOptionBoundary(tokens);
  const next = [];

  for (let index = 0; index < controls.length; index += 1) {
    const token = controls[index];
    let matched = false;

    for (const name of names) {
      if (token === name) {
        if (index + 1 >= controls.length) throw missingOptionValue(name);
        matched = true;
        index += 1;
        break;
      }
      if (token.startsWith(`${name}=`)) {
        matched = true;
        break;
      }
    }

    if (!matched) next.push(token);
  }

  return joinOptionBoundary(next, literal, hadBoundary);
}

function injectSkillMentions(tokens, skills) {
  const mentions = skills.map((skill) => `$${skill.name}`);
  if (!mentions.length) return [...tokens];

  const { controls, literal, hadBoundary } = splitOptionBoundary(tokens);
  if (!hadBoundary) return [...controls, ...mentions];
  return [...controls, "--", ...mentions, ...literal];
}

function resolveCwd(tokens) {
  const requested = readOption(tokens, ["--cwd", "-C"]);
  return requested ? path.resolve(process.cwd(), requested) : process.cwd();
}

function renderModels(models) {
  if (!models.length) return "No Codex models were advertised.\n";
  return `${models
    .map((model) => {
      const flags = [model.isDefault ? "default" : null, model.hidden ? "hidden" : null].filter(Boolean);
      const efforts = (model.supportedReasoningEfforts ?? []).map((item) => item.reasoningEffort).join(",");
      const policy = describeModelPolicy(model.model);
      const policyText = policy
        ? ` | tier=${policy.tier} | min-cli=${policy.minCli}${policy.aliases.length ? ` | aliases=${policy.aliases.join(",")}` : ""}`
        : "";
      const suffix = flags.length ? ` [${flags.join(",")}]` : "";
      return `${model.model}${suffix} | effort=${efforts || "-"} | multi-agent=${model.multiAgentVersion ?? "-"}${policyText}`;
    })
    .join("\n")}\n`;
}

function renderSkills(entries) {
  const skills = entries.flatMap((entry) => (entry.skills ?? []).map((skill) => ({ ...skill, cwd: entry.cwd })));
  if (!skills.length) return "No Codex skills were discovered for this repository.\n";
  return `${skills
    .map((skill) => {
      const state = skill.enabled === false ? "disabled" : "enabled";
      const owner = skill.pluginId ? ` | plugin=${skill.pluginId}` : "";
      return `${skill.name} | ${skill.scope} | ${state}${owner}`;
    })
    .join("\n")}\n`;
}

async function handleModels(argv) {
  const tokens = normalizeArgv(argv);
  const models = await listCodexModels(resolveCwd(tokens), { includeHidden: hasFlag(tokens, "--all") });
  process.stdout.write(hasFlag(tokens, "--json") ? `${JSON.stringify(models, null, 2)}\n` : renderModels(models));
}

async function handleSkills(argv) {
  const tokens = normalizeArgv(argv);
  const entries = await listCodexSkills(resolveCwd(tokens), { forceReload: hasFlag(tokens, "--reload") });
  process.stdout.write(hasFlag(tokens, "--json") ? `${JSON.stringify(entries, null, 2)}\n` : renderSkills(entries));
}

async function handleTask(argv) {
  const tokens = normalizeArgv(argv);
  const selection = await resolveTaskRuntime(resolveCwd(tokens), {
    model: readOption(tokens, ["--model", "-m"]),
    profile: readOption(tokens, ["--profile"]),
    effort: readOption(tokens, ["--effort"]),
    skillNames: readOptions(tokens, ["--skill"])
  });

  let normalized = removeOptions(tokens, ["--profile", "--skill"]);
  normalized = replaceOption(normalized, ["--model", "-m"], "--model", selection.model);
  normalized = replaceOption(normalized, ["--effort"], "--effort", selection.effort);
  normalized = injectSkillMentions(normalized, selection.skills);

  const child = spawnSync(process.execPath, [COMPANION, "task", ...normalized], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    windowsHide: true
  });
  if (child.error) throw child.error;
  process.exitCode = child.status ?? 1;
}

async function main() {
  const [subcommand, ...argv] = process.argv.slice(2);
  if (subcommand === "models") return handleModels(argv);
  if (subcommand === "skills") return handleSkills(argv);
  if (subcommand === "task") return handleTask(argv);
  throw new Error("Usage: codex-runtime.mjs <models|skills|task> [...]");
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}

export {
  injectSkillMentions,
  normalizeArgv,
  readOption,
  readOptions,
  removeOptions,
  replaceOption,
  renderModels,
  renderSkills,
  resolveCwd,
  splitOptionBoundary
};
