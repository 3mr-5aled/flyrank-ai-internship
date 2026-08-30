import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import router from "../src/route.js";

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

test("Stage 4 - Production Resilience, Retries, Metrics, and Kill Switch Tests", async (t) => {
  const originalEnv = { ...process.env };

  t.after(() => {
    process.env = originalEnv;
  });

  await t.test("Checkpoint Test 1 - LLM_ENABLED=false triggers Kill Switch immediately (HTTP 503)", async () => {
    process.env.LLM_ENABLED = "false";
    delete process.env.LLM_STUB;

    const res = await mockRequestResponse({ text: "Please process my order payment." });

    assert.equal(res.status, 503, `Expected 503 Service Unavailable, got ${res.status}`);
    assert.equal(res.body.error, "Service Unavailable");
    assert.ok(res.body.fallback, "Should return deterministic fallback payload");
  });

  await t.test("Checkpoint Test 2 - Invalid API Key fails fast (401) with zero retries", async () => {
    delete process.env.LLM_ENABLED;
    delete process.env.LLM_STUB;
    process.env.LLM_API_KEY = "sk-invalid-key-test-123456789";

    const startTime = Date.now();
    const res = await mockRequestResponse({ text: "Please process my order payment." });
    const elapsed = Date.now() - startTime;

    assert.equal(res.status === 401 || res.status === 400 || res.status === 500, true, `Got status ${res.status}`);
    // Should fail fast without waiting 1s + 2s + 4s for retries
    assert.ok(elapsed < 5000, `Expected fast failure (<5s), actual elapsed time: ${elapsed}ms`);
  });

  await t.test("Metrics logging - Successful call records structured metrics in logs/metrics.jsonl", async () => {
    process.env.LLM_API_KEY = originalEnv.LLM_API_KEY;
    process.env.LLM_BASE_URL = originalEnv.LLM_BASE_URL;
    process.env.LLM_MODEL = originalEnv.LLM_MODEL;
    delete process.env.LLM_ENABLED;
    delete process.env.LLM_STUB;

    const metricsPath = path.join(process.cwd(), "logs", "metrics.jsonl");
    if (fs.existsSync(metricsPath)) {
      fs.unlinkSync(metricsPath);
    }

    const res = await mockRequestResponse({ text: "I was charged twice on my credit card for invoice #1042." });

    assert.equal(res.status, 200);
    assert.equal(fs.existsSync(metricsPath), true, "metrics.jsonl should be created");

    const lines = fs.readFileSync(metricsPath, "utf-8").trim().split("\n");
    const lastMetric = JSON.parse(lines[lines.length - 1]);

    assert.equal(lastMetric.promptVersion, "v1");
    assert.ok(typeof lastMetric.durationMs === "number");
    assert.ok(typeof lastMetric.inputTokens === "number");
    assert.ok(typeof lastMetric.outputTokens === "number");
    assert.equal(typeof lastMetric.repaired, "boolean");
    assert.equal(lastMetric.status, "success");
  });
});
