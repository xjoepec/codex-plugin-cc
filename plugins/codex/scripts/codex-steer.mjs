#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { parseArgs, splitRawArgumentString } from "./lib/args.mjs";
import { CodexAppServerClient } from "./lib/app-server.mjs";
import { appendLogLine, SESSION_ID_ENV } from "./lib/tracked-jobs.mjs";
import { listJobs, readJobFile, resolveJobFile } from "./lib/state.mjs";
import { resolveWorkspaceRoot } from "./lib/workspace.mjs";

function normalizeArgv(argv) {
  if (argv.length !== 1) return argv;
  const [raw] = argv;
  return raw?.trim() ? splitRawArgumentString(raw) : [];
}

function newestFirst(jobs) {
  return [...jobs].sort((a, b) => String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")));
}

function activeTasks(workspaceRoot, env = process.env) {
  const sessionId = env[SESSION_ID_ENV] ?? null;
  return newestFirst(listJobs(workspaceRoot)).filter(
    (job) => job.jobClass === "task" && job.status === "running" && (!sessionId || job.sessionId === sessionId)
  );
}

function matchActiveJob(jobs, reference) {
  if (!reference) {
    if (jobs.length === 1) return jobs[0];
    if (!jobs.length) throw new Error("No running Codex task is available to steer in this session.");
    throw new Error("Multiple Codex tasks are running. Pass --job <job-id>.");
  }

  const exact = jobs.find((job) => job.id === reference);
  if (exact) return exact;
  const matches = jobs.filter((job) => job.id.startsWith(reference));
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) throw new Error(`Job reference "${reference}" is ambiguous.`);
  throw new Error(`No running Codex task matches "${reference}".`);
}

function liveJob(workspaceRoot, job) {
  const file = resolveJobFile(workspaceRoot, job.id);
  if (!fs.existsSync(file)) return job;
  return { ...job, ...readJobFile(file) };
}

export function resolveSteerTarget(cwd, reference, env = process.env) {
  const workspaceRoot = resolveWorkspaceRoot(cwd);
  const job = liveJob(workspaceRoot, matchActiveJob(activeTasks(workspaceRoot, env), reference));
  if (!job.threadId || !job.turnId) {
    throw new Error(`Job ${job.id} is running but has not exposed a steerable Codex turn yet.`);
  }
  return { workspaceRoot, job };
}

export function buildSteerParams(job, instruction) {
  return {
    threadId: job.threadId,
    expectedTurnId: job.turnId,
    input: [{ type: "text", text: instruction, text_elements: [] }]
  };
}

export async function steerCodexJob(cwd, reference, instruction, options = {}) {
  const { workspaceRoot, job } = resolveSteerTarget(cwd, reference, options.env ?? process.env);
  const connect = options.connect ?? CodexAppServerClient.connect;
  const client = await connect(workspaceRoot, { reuseExistingBroker: true });
  try {
    await client.request("turn/steer", buildSteerParams(job, instruction));
  } finally {
    await client.close().catch(() => {});
  }
  appendLogLine(job.logFile, `Steered: ${instruction}`);
  return { jobId: job.id, threadId: job.threadId, turnId: job.turnId, instruction };
}

async function main() {
  const { options, positionals } = parseArgs(normalizeArgv(process.argv.slice(2)), {
    valueOptions: ["job", "cwd"],
    booleanOptions: ["json"]
  });
  const instruction = positionals.join(" ").trim();
  if (!instruction) throw new Error("Provide an instruction to steer into the running Codex task.");
  const cwd = options.cwd ? path.resolve(process.cwd(), options.cwd) : process.cwd();
  const result = await steerCodexJob(cwd, options.job ?? null, instruction);
  process.stdout.write(
    options.json
      ? `${JSON.stringify(result, null, 2)}\n`
      : `Steered ${result.jobId} (${result.turnId}): ${instruction}\n`
  );
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
