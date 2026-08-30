import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import router from "../src/route.js";
import { OutputSchema } from "../src/llm/schema.js";

function mockRequestResponse(reqBody) {
  return new Promise((resolve) => {
    const req = { body: reqBody };
    const res = {
      statusCode: 200,
      jsonBody: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonBody = data;
        resolve({ status: this.statusCode, body: this.jsonBody });
      },
    };

    const route = router.stack.find((layer) => layer.route && layer.route.path === "/classify");
    const handler = route.route.stack[0].handle;
    handler(req, res);
  });
}

test("Stage 3 - Trustworthy Output, Repair, and Quarantine Tests", async (t) => {
  const quarantineLogPath = path.join(process.cwd(), "logs", "quarantine.jsonl");

  await t.test("Happy Path with STUB_RESPONSE returns 200 and schema-valid output", async () => {
    process.env.LLM_STUB = "1";
    const res = await mockRequestResponse({ text: "I need help with billing." });
    assert.equal(res.status, 200);
    const parsed = OutputSchema.safeParse(res.body);
    assert.equal(parsed.success, true);
  });

  await t.test("Checkpoint Test - Non-JSON output triggers repair and 422 quarantine logging", async () => {
    delete process.env.LLM_STUB;

    if (fs.existsSync(quarantineLogPath)) {
      fs.unlinkSync(quarantineLogPath);
    }

    const promptPath = path.join(process.cwd(), "prompts", "support-classifier-v1.md");
    const originalPrompt = fs.readFileSync(promptPath, "utf-8");

    try {
      // Force system prompt to return plain text, causing JSON parse & validation failure on both attempts
      const nonJsonPrompt = `You must reply to all messages with only the raw text string: "NOT_VALID_JSON_RESPONSE". Do not output JSON or brackets.`;
      fs.writeFileSync(promptPath, nonJsonPrompt, "utf-8");

      const res = await mockRequestResponse({ text: "My app keeps crashing continuously!" });

      assert.equal(res.status, 422, `Expected HTTP 422 on invalid model response, got ${res.status}`);
      assert.equal(res.body.error, "Model output failed schema validation after repair attempt");
      assert.ok(res.body.details, "Should include details of validation error");

      // Verify quarantine.jsonl was created and has log entry
      assert.equal(fs.existsSync(quarantineLogPath), true, "quarantine.jsonl should be created");
      const lines = fs.readFileSync(quarantineLogPath, "utf-8").trim().split("\n");
      assert.equal(lines.length >= 1, true, "quarantine.jsonl should contain at least 1 log entry");

      const lastLog = JSON.parse(lines[lines.length - 1]);
      assert.equal(lastLog.promptVersion, "v1");
      assert.equal(lastLog.input, "My app keeps crashing continuously!");
      assert.ok(lastLog.rawOutput, "Quarantine log should record rawOutput");
    } finally {
      // Restore original prompt
      fs.writeFileSync(promptPath, originalPrompt, "utf-8");
    }
  });
});
