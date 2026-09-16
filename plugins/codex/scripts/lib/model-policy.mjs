const POLICIES = Object.freeze({
  "gpt-6-astra": Object.freeze({
    family: "gpt-6",
    tier: "max",
    minCli: "0.153.0",
    aliases: ["astra"],
    use: "hardest end-to-end coding, reasoning, research, computer use, and multi-agent work"
  }),
  "gpt-5.6-sol": Object.freeze({
    family: "gpt-5.6",
    tier: "strong",
    minCli: "0.144.0",
    aliases: ["gpt-5.6", "sol"],
    use: "complex professional coding and research"
  }),
  "gpt-5.6-terra": Object.freeze({
    family: "gpt-5.6",
    tier: "balanced",
    minCli: "0.144.0",
    aliases: ["terra"],
    use: "balanced intelligence and cost"
  }),
  "gpt-5.6-luna": Object.freeze({
    family: "gpt-5.6",
    tier: "fast",
    minCli: "0.144.0",
    aliases: ["luna"],
    use: "cost-sensitive, high-volume bounded work"
  })
});

const PROFILE_MODELS = Object.freeze({
  max: "gpt-6-astra",
  strong: "gpt-5.6-sol",
  balanced: "gpt-5.6-terra",
  fast: "gpt-5.6-luna"
});

const ALIAS_MODELS = new Map(
  Object.entries(POLICIES).flatMap(([model, policy]) => [model, ...policy.aliases].map((alias) => [alias.toLowerCase(), model]))
);

function normalize(value) {
  const text = value == null ? "" : String(value).trim();
  return text || null;
}

export function canonicalModel(value) {
  const requested = normalize(value);
  if (!requested) return null;
  return ALIAS_MODELS.get(requested.toLowerCase()) ?? requested;
}

export function modelForProfile(value) {
  const profile = normalize(value)?.toLowerCase() ?? null;
  if (!profile) return null;
  const model = PROFILE_MODELS[profile];
  if (!model) {
    throw new Error(`Unknown model profile "${value}". Use one of: ${Object.keys(PROFILE_MODELS).join(", ")}.`);
  }
  return model;
}

export function modelPolicy(value) {
  const model = canonicalModel(value);
  return model ? POLICIES[model] ?? null : null;
}

export function modelAliases(value) {
  const model = canonicalModel(value);
  const policy = model ? POLICIES[model] : null;
  return policy ? [...policy.aliases] : [];
}

export function parseVersion(value) {
  const match = String(value ?? "").match(/(?:^|\D)(\d+)\.(\d+)\.(\d+)(?:\D|$)/);
  return match ? match.slice(1, 4).map(Number) : null;
}

export function compareVersions(left, right) {
  const a = Array.isArray(left) ? left : parseVersion(left);
  const b = Array.isArray(right) ? right : parseVersion(right);
  if (!a || !b) return null;
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] < b[index] ? -1 : 1;
  }
  return 0;
}

export function assertModelCliVersion(model, versionText) {
  const policy = modelPolicy(model);
  if (!policy) return;
  const actual = parseVersion(versionText);
  if (!actual || compareVersions(actual, policy.minCli) >= 0) return;
  throw new Error(
    `${canonicalModel(model)} requires Codex CLI ${policy.minCli} or newer; installed runtime reports ${actual.join(".")}. ` +
      "Update with `npm install -g @openai/codex@latest`."
  );
}

export function describeModelPolicy(model) {
  const canonical = canonicalModel(model);
  const policy = canonical ? POLICIES[canonical] : null;
  if (!policy) return null;
  return { model: canonical, ...policy, aliases: [...policy.aliases] };
}

export const FRONTIER_MODEL_IDS = Object.freeze(Object.keys(POLICIES));
export const MODEL_PROFILES = Object.freeze({ ...PROFILE_MODELS });
