import fs from "fs";
import path from "path";
import router from "../src/route.js";

async function makeRequest(text) {
  return new Promise((resolve) => {
    const req = { body: { text } };
    const res = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        resolve({ status: this.statusCode, body: data });
      },
    };

    const route = router.stack.find((layer) => layer.route && layer.route.path === "/classify");
    const handler = route.route.stack[0].handle;
    handler(req, res);
  });
}

async function runEval() {
  delete process.env.LLM_STUB;
  delete process.env.LLM_ENABLED;

  const casesPath = path.join(process.cwd(), "evals", "cases.json");
  const cases = JSON.parse(fs.readFileSync(casesPath, "utf-8"));

  console.log(`\n==================================================`);
  console.log(`         RUNNING SUPPORT CLASSIFIER EVAL          `);
  console.log(`         Date: ${new Date().toISOString().split("T")[0]} | Prompt Version: v1`);
  console.log(`==================================================\n`);

  let matchedCount = 0;
  const failedCases = [];

  for (const tc of cases) {
    console.log(`Evaluating Case #${tc.id}: "${tc.name}"...`);
    const response = await makeRequest(tc.input);

    if (response.status !== 200) {
      console.log(`  ❌ Failed HTTP Request with status ${response.status}`);
      failedCases.push({
        id: tc.id,
        name: tc.name,
        input: tc.input,
        expectedCategory: tc.expectedCategory,
        actual: response.body,
        reason: `HTTP ${response.status} error`,
      });
      continue;
    }

    const actualCategory = response.body.category;
    const actualConfidence = response.body.confidence;

    let isMatch = actualCategory === tc.expectedCategory;

    if (tc.maxConfidence !== undefined && actualConfidence > tc.maxConfidence) {
      isMatch = false;
    }

    if (isMatch) {
      matchedCount++;
      console.log(
        `  ✔ Passed! Category: '${actualCategory}' | Urgency: '${response.body.urgency}' | Confidence: ${actualConfidence}`
      );
    } else {
      console.log(
        `  ❌ Mismatch! Expected Category: '${tc.expectedCategory}', Got: '${actualCategory}' (Confidence: ${actualConfidence})`
      );
      failedCases.push({
        id: tc.id,
        name: tc.name,
        input: tc.input,
        expectedCategory: tc.expectedCategory,
        actualCategory,
        actualConfidence,
        actualReason: response.body.reason,
      });
    }
  }

  const scorePercentage = ((matchedCount / cases.length) * 100).toFixed(1);

  console.log(`\n--------------------------------------------------`);
  console.log(`EVALUATION SUMMARY SCORE: ${matchedCount} / ${cases.length} (${scorePercentage}%)`);
  console.log(`--------------------------------------------------\n`);

  if (failedCases.length > 0) {
    console.log("FAILED TEST CASES:");
    failedCases.forEach((f) => {
      console.log(` - Case #${f.id} (${f.name}): Expected category '${f.expectedCategory}', got '${f.actualCategory}'`);
    });
  } else {
    console.log("🎉 All 8 evaluation test cases passed perfectly!");
  }

  return { matchedCount, total: cases.length, scorePercentage, failedCases };
}

runEval().catch(console.error);
