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

function optionLimit(tokens) {
  const index = tokens.indexOf("--");
  return index === -1 ? tokens.length : index;
}

function readOptions(tokens, names) {
  const values = [];
  const limit = optionLimit(tokens);
  for (let index = 0; index < limit; index += 1) {
    const token = tokens[index];
    for (const name of names) {
      if (token === name) {
        if (index + 1 < limit) values.push(tokens[index + 1]);
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
  return tokens.slice(0, optionLimit(tokens)).some((token) => token === name || token === `${name}=true`);
}

function replaceOption(tokens, names, canonicalName, value) {
  if (value == null) return [...tokens];

  const next = [...tokens];
  const limit = optionLimit(next);
  for (let index = limit - 1; index >= 0; index -= 1) {
    for (const name of names) {
      if (next[index] === name && index + 1 < limit) {
        next[index] = canonicalName;
        next[index + 1] = value;
        return next;
      }
      const prefix = `${name}=`;
      if (next[index].startsWith(prefix)) {
        next[index] = `${canonicalName}=${value}`;
        return next;
      }
    }
  }

  next.splice(limit, 0, canonicalName, value);
  return next;
}

function removeOptions(tokens, names) {
  const next = [];
  const limit = optionLimit(tokens);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (index >= limit) {
      next.push(token);
      continue;
    }

    let matched = false;
    for (const name of names) {
      if (token === name) {
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
  return next;
}

function injectSkillMentions(tokens, skills) {
  const mentions = skills.map((skill) => `$${skill.name}`);
  if (!mentions.length) return [...tokens];
  const next = [...tokens];
  const boundary = next.indexOf("--");
  if (boundary === -1) next.push(...mentions);
  else next.splice(boundary + 1, 0, ...mentions);
  return next;
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
  resolveCwd
};
