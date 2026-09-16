import assert from "node:assert/strict";
import test from "node:test";

import { jobsVisibleToSession, terminalTransitions } from "../plugins/codex/scripts/codex-monitor.mjs";

test("monitor suppresses historical terminal jobs on its first snapshot", () => {
  const result = terminalTransitions(new Map(), [{ id: "old", status: "completed" }], false);
  assert.deepEqual(result.events, []);
  assert.equal(result.next.get("old"), "completed");
});

test("monitor emits new terminal transitions exactly once", () => {
  const previous = new Map([["task-1", "running"]]);
  const done = terminalTransitions(previous, [{ id: "task-1", status: "completed", summary: "Fixed tests" }], true);
  assert.deepEqual(done.events, [{ id: "task-1", status: "completed", summary: "Fixed tests" }]);
  assert.deepEqual(terminalTransitions(done.next, [{ id: "task-1", status: "completed" }], true).events, []);
});

test("monitor only observes jobs owned by the current Claude session", () => {
  const jobs = [
    { id: "a", status: "running", sessionId: "session-a" },
    { id: "b", status: "completed", sessionId: "session-b" },
    { id: "legacy", status: "completed", sessionId: null }
  ];

  assert.deepEqual(
    jobsVisibleToSession(jobs, { CODEX_COMPANION_SESSION_ID: "session-a" }).map((job) => job.id),
    ["a"]
  );
  assert.deepEqual(jobsVisibleToSession(jobs, {}).map((job) => job.id), ["a", "b", "legacy"]);
});
