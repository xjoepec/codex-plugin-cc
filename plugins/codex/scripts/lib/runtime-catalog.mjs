import { CodexAppServerClient } from "./app-server.mjs";
import { assertModelCliVersion, canonicalModel, modelAliases, modelForProfile, modelPolicy } from "./model-policy.mjs";
import { runCommand } from "./process.mjs";

const METHOD_UNAVAILABLE = -32601;

async function withClient(cwd, fn) {
  const client = await CodexAppServerClient.connect(cwd, { reuseExistingBroker: true });
  try {
    return await fn(client);
  } finally {
    await client.close().catch(() => {});
  }
}

function currentRuntimeError(capability, error) {
  if (error?.rpcCode !== METHOD_UNAVAILABLE) return error;
  return new Error(
    `This Codex runtime does not expose ${capability}. Update Codex with \`npm install -g @openai/codex@latest\`.`,
    { cause: error }
  );
}

async function requestCurrent(client, method, params, capability) {
  try {
    return await client.request(method, params);
  } catch (error) {
    throw currentRuntimeError(capability, error);
  }
}

async function collectModels(client, includeHidden = true) {
  const models = [];
  let cursor = null;
  do {
    const page = await requestCurrent(
      client,
      "model/list",
      { cursor, limit: 100, includeHidden },
      "model discovery"
    );
    models.push(...(page.data ?? []));
    cursor = page.nextCursor ?? null;
  } while (cursor);
  return models;
}

function normalize(value) {
  const text = value == null ? "" : String(value).trim();
  return text || null;
}

function renderSkillDiscoveryError(error) {
  if (typeof error === "string") return normalize(error);
  if (error && typeof error === "object") {
    const message = normalize(error.message ?? error.error ?? error.reason);
    if (message) return message;
    try {
      return JSON.stringify(error);
    } catch {
      return null;
    }
  }
  return normalize(error);
}

function modelKeys(model) {
  return [model.id, model.model].filter(Boolean);
}

function cliVersionText(cwd) {
  const result = runCommand("codex", ["--version"], { cwd });
  if (result.error || result.status !== 0) return null;
  return result.stdout.trim() || result.stderr.trim() || null;
}

export async function listCodexModels(cwd, options = {}) {
  return withClient(cwd, (client) => collectModels(client, Boolean(options.includeHidden)));
}

export async function listCodexSkills(cwd, options = {}) {
  return withClient(cwd, async (client) => {
    const response = await requestCurrent(
      client,
      "skills/list",
      { cwds: [cwd], forceReload: Boolean(options.forceReload) },
      "skill discovery"
    );
    return response.data ?? [];
  });
}

export function resolveModelSelection(models, requested = {}) {
  const rawModel = normalize(requested.model);
  const requestedModel = rawModel ? canonicalModel(rawModel) : null;
  const requestedEffort = normalize(requested.effort);

  if (!requestedModel && !requestedEffort) return { model: null, effort: null };

  const candidates = requestedModel ? [requestedModel, ...modelAliases(requestedModel)] : [];
  const selected = requestedModel
    ? models.find((model) => modelKeys(model).some((key) => candidates.includes(key)))
    : models.find((model) => model.isDefault);

  if (!selected) {
    const subject = requestedModel ? `model "${requestedModel}"` : "default model";
    const policy = requestedModel ? modelPolicy(requestedModel) : null;
    const floor = policy ? ` It requires Codex CLI ${policy.minCli}+ when available to your account.` : "";
    throw new Error(`Codex did not advertise ${subject}.${floor} Run /codex:models --all to inspect the live catalog.`);
  }

  if (requestedEffort) {
    const supported = (selected.supportedReasoningEfforts ?? []).map((item) => item.reasoningEffort);
    if (!supported.includes(requestedEffort)) {
      const choices = supported.length ? supported.join(", ") : "none advertised";
      throw new Error(`Reasoning effort "${requestedEffort}" is not supported by ${selected.model}. Supported: ${choices}.`);
    }
  }

  return { model: requestedModel ? selected.model : null, effort: requestedEffort };
}

export function resolveSkillSelection(entries, requestedNames = []) {
  const requested = [...new Set(requestedNames.map(normalize).filter(Boolean))];
  if (!requested.length) return [];

  const skills = entries.flatMap((entry) => entry.skills ?? []).filter((skill) => skill.enabled !== false);
  const discoveryErrors = entries
    .flatMap((entry) => entry.errors ?? [])
    .map(renderSkillDiscoveryError)
    .filter(Boolean);

  return requested.map((name) => {
    const skill = skills.find((candidate) => candidate.name === name);
    if (!skill) {
      const detail = discoveryErrors.length
        ? ` Skill discovery reported: ${discoveryErrors.join("; ")}.`
        : "";
      throw new Error(`Codex skill "${name}" is not available.${detail} Run /codex:skills to inspect the live catalog.`);
    }
    return skill;
  });
}

export async function resolveTaskRuntime(cwd, requested = {}) {
  const explicitModel = normalize(requested.model);
  const profile = normalize(requested.profile);
  const effort = normalize(requested.effort);
  const skillNames = requested.skillNames ?? [];

  if (explicitModel && profile) throw new Error("Choose either --model or --profile, not both.");

  const model = explicitModel ? canonicalModel(explicitModel) : modelForProfile(profile);
  if (!model && !effort && !skillNames.length) return { model: null, effort: null, skills: [] };

  if (model) {
    const version = cliVersionText(cwd);
    if (version) assertModelCliVersion(model, version);
  }

  return withClient(cwd, async (client) => {
    const models = model || effort ? await collectModels(client, true) : [];
    const skillEntries = skillNames.length
      ? (
          await requestCurrent(
            client,
            "skills/list",
            { cwds: [cwd], forceReload: false },
            "skill discovery"
          )
        ).data ?? []
      : [];

    return {
      ...resolveModelSelection(models, { model, effort }),
      skills: resolveSkillSelection(skillEntries, skillNames)
    };
  });
}
