import assert from "node:assert/strict";
import test from "node:test";

import { terminalTransitions } from "../plugins/codex/scripts/codex-monitor.mjs";

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
