import test from "node:test";
import assert from "node:assert/strict";
import router from "../src/route.js";
import { OutputSchema } from "../src/llm/schema.js";

// Mock helper to invoke express route handlers directly
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

test("Stage 1 - Endpoint and validation tests", async (t) => {
  process.env.LLM_STUB = "1";

  await t.test("Valid request with LLM_STUB=1 returns 200 and schema-compliant response", async () => {
    const response = await mockRequestResponse({
      text: "My account balance is not updating after payment.",
    });

    assert.equal(response.status, 200);
    const parsed = OutputSchema.safeParse(response.body);
    assert.equal(parsed.success, true, `Response body should match OutputSchema: ${JSON.stringify(parsed.error?.issues)}`);
    assert.equal(typeof response.body.category, "string");
    assert.equal(typeof response.body.urgency, "string");
    assert.equal(typeof response.body.confidence, "number");
    assert.equal(typeof response.body.reason, "string");
  });

  await t.test("Missing text field returns 400 naming field 'text'", async () => {
    const response = await mockRequestResponse({});

    assert.equal(response.status, 400);
    assert.equal(response.body.field, "text");
  });

  await t.test("Wrong type for text field returns 400 naming field 'text'", async () => {
    const response = await mockRequestResponse({ text: 12345 });

    assert.equal(response.status, 400);
    assert.equal(response.body.field, "text");
  });

  await t.test("Empty string text field returns 400 naming field 'text'", async () => {
    const response = await mockRequestResponse({ text: "" });

    assert.equal(response.status, 400);
    assert.equal(response.body.field, "text");
  });

  await t.test("Text exceeding 2000 characters returns 400 naming field 'text'", async () => {
    const longText = "a".repeat(2001);
    const response = await mockRequestResponse({ text: longText });

    assert.equal(response.status, 400);
    assert.equal(response.body.field, "text");
  });
});
