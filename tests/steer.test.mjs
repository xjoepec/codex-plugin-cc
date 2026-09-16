import assert from "node:assert/strict";
import test from "node:test";

import { buildSteerParams } from "../plugins/codex/scripts/codex-steer.mjs";

test("steering targets the exact tracked turn with ordinary user input", () => {
  assert.deepEqual(
    buildSteerParams({ threadId: "thr_1", turnId: "turn_9" }, "Keep the public API unchanged."),
    {
      threadId: "thr_1",
      expectedTurnId: "turn_9",
      input: [{ type: "text", text: "Keep the public API unchanged.", text_elements: [] }]
    }
  );
});
