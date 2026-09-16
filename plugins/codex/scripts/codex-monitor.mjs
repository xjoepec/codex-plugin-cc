#!/usr/bin/env node

import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { listJobs } from "./lib/state.mjs";

const TERMINAL = new Set(["completed", "failed", "cancelled"]);
const POLL_MS = 1000;

export function terminalTransitions(previous, jobs, initialized = true) {
  const next = new Map();
  const events = [];

  for (const job of jobs) {
    next.set(job.id, job.status);
    const prior = previous.get(job.id);
    if (initialized && TERMINAL.has(job.status) && prior !== job.status) {
      events.push({
        id: job.id,
        status: job.status,
        summary: job.summary ?? job.title ?? null
      });
    }
  }

  return { next, events };
}

function render(event) {
  const detail = event.summary ? `: ${event.summary}` : "";
  return `Codex job ${event.id} ${event.status}${detail}`;
}

function main() {
  let previous = new Map();
  let initialized = false;

  const poll = () => {
    try {
      const result = terminalTransitions(previous, listJobs(process.cwd()), initialized);
      previous = result.next;
      initialized = true;
      for (const event of result.events) process.stdout.write(`${render(event)}\n`);
    } catch (error) {
      process.stderr.write(`[codex-monitor] ${error instanceof Error ? error.message : String(error)}\n`);
    }
  };

  poll();
  setInterval(poll, POLL_MS);
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
