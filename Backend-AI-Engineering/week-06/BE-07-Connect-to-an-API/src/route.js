import express from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { InputSchema, OutputSchema, STUB_RESPONSE } from "./llm/schema.js";

const router = express.Router();

const promptVersion = "v1";
const promptPath = path.join(process.cwd(), "prompts", `support-classifier-${promptVersion}.md`);

const getOpenAIClient = () => {
  if (!process.env.LLM_API_KEY) return null;
  return new OpenAI({
    baseURL: process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1",
    apiKey: process.env.LLM_API_KEY,
    timeout: 30000, // 30 second real timeout
    maxRetries: 0,  // Explicitly set 0 to handle retries via custom backoff wrapper
  });
};

function extractAndParseJson(rawText) {
  if (typeof rawText !== "string") {
    throw new SyntaxError("Model output is not a string");
  }

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = rawText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();

  // Locate first '{' and last '}' to extract object payload
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }

  return JSON.parse(cleaned);
}

function logToQuarantine({ input, error, rawOutput, promptVersion }) {
  try {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const quarantinePath = path.join(logsDir, "quarantine.jsonl");
    const entry =
      JSON.stringify({
        timestamp: new Date().toISOString(),
        promptVersion: promptVersion || "v1",
        input,
        error: typeof error === "string" ? error : error?.message || String(error),
        rawOutput,
      }) + "\n";

    fs.appendFileSync(quarantinePath, entry, "utf-8");
  } catch (err) {
    console.error("Failed writing to quarantine log:", err);
  }
}

function logCallMetrics({ promptVersion, model, usage, durationMs, repaired, status, error }) {
  const metric = {
    timestamp: new Date().toISOString(),
    promptVersion: promptVersion || "v1",
    model: model || process.env.LLM_MODEL || "openrouter/free",
    inputTokens: usage?.prompt_tokens ?? 0,
    outputTokens: usage?.completion_tokens ?? 0,
    totalTokens: usage?.total_tokens ?? 0,
    durationMs,
    repaired: !!repaired,
    status: status || "success",
    error: error || null,
  };

  console.log("[METRICS]", JSON.stringify(metric));

  try {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    fs.appendFileSync(path.join(logsDir, "metrics.jsonl"), JSON.stringify(metric) + "\n", "utf-8");
  } catch (e) {
    console.error("Failed writing metrics log:", e);
  }
}

async function callModelWithRetry(client, requestPayload) {
  const maxAttempts = 3;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    const startTime = Date.now();
    try {
      const completion = await client.chat.completions.create(requestPayload);
      const durationMs = Date.now() - startTime;
      return { completion, durationMs, attempt };
    } catch (err) {
      const durationMs = Date.now() - startTime;
      const statusCode = err.status || err.statusCode || (err.name === "APIConnectionTimeoutError" ? 504 : null);

      const isTimeout = err.name === "APIConnectionTimeoutError" || err.code === "ETIMEDOUT" || statusCode === 504;
      const is429 = statusCode === 429;
      const is5xx = statusCode >= 500 && statusCode < 600;

      // Retry ONLY on timeouts, 429, and 5xx. Never retry 400, 401, or 403.
      const isRetryable = isTimeout || is429 || is5xx;

      if (!isRetryable || attempt >= maxAttempts) {
        err.durationMs = durationMs;
        err.isTimeout = isTimeout;
        err.statusCode = statusCode || 500;
        throw err;
      }

      // Exponential backoff: 1s, 2s, 4s + Jitter
      let backoffMs = Math.pow(2, attempt - 1) * 1000;

      // Honor Retry-After header if present on 429
      if (is429 && err.headers) {
        const retryAfterHeader = err.headers["retry-after"] || err.headers["Retry-After"];
        if (retryAfterHeader) {
          const parsedSeconds = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsedSeconds)) {
            backoffMs = parsedSeconds * 1000;
          }
        }
      }

      const jitter = Math.floor(Math.random() * 200);
      const totalWait = backoffMs + jitter;

      console.warn(
        `[LLM Retry] Attempt ${attempt} failed with status ${statusCode || err.name}. Retrying in ${totalWait}ms...`
      );
      await new Promise((res) => setTimeout(res, totalWait));
    }
  }
}

const handleClassify = async (req, res) => {
  const parseResult = InputSchema.safeParse(req.body);

  if (!parseResult.success) {
    const firstIssue = parseResult.error.issues[0];
    const fieldName = firstIssue?.path[0] || "text";
    return res.status(400).json({
      error: "Validation error",
      field: fieldName,
      message: firstIssue?.message || `Invalid input field: ${fieldName}`,
      issues: parseResult.error.issues,
    });
  }

  // Kill Switch: LLM_ENABLED=false
  if (process.env.LLM_ENABLED === "false" || process.env.LLM_ENABLED === "0") {
    return res.status(503).json({
      error: "Service Unavailable",
      message: "LLM feature is currently disabled via kill switch (LLM_ENABLED=false).",
      fallback: STUB_RESPONSE,
    });
  }

  // Stub mode: LLM_STUB=1
  if (process.env.LLM_STUB === "1" || process.env.LLM_STUB === "true") {
    return res.status(200).json(STUB_RESPONSE);
  }

  const client = getOpenAIClient();
  if (!client) {
    return res.status(200).json(STUB_RESPONSE);
  }

  const systemPrompt = fs.readFileSync(promptPath, "utf-8");
  const userContent = JSON.stringify({ text: parseResult.data.text });

  // --- First Attempt ---
  let firstRawOutput = "";
  let firstErrorMessage = "";
  let totalDurationMs = 0;
  let firstUsage = null;
  let completion;

  try {
    const resCall = await callModelWithRetry(client, {
      model: process.env.LLM_MODEL || "openrouter/free",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    completion = resCall.completion;
    totalDurationMs += resCall.durationMs;
    firstUsage = completion?.usage;
    firstRawOutput = completion?.choices[0]?.message?.content || "";
  } catch (apiErr) {
    totalDurationMs += apiErr.durationMs || 0;

    logCallMetrics({
      promptVersion,
      model: process.env.LLM_MODEL,
      usage: null,
      durationMs: totalDurationMs,
      repaired: false,
      status: "failed",
      error: apiErr.message,
    });

    if (apiErr.isTimeout || apiErr.statusCode === 504) {
      return res.status(504).json({
        error: "Gateway Timeout",
        message: "LLM request timed out after 30 seconds.",
      });
    }

    if (apiErr.statusCode === 401) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid or missing LLM API key. Request was not retried.",
      });
    }

    return res.status(apiErr.statusCode || 500).json({
      error: "LLM Service Error",
      message: apiErr.message,
    });
  }

  // Parse & Validate Attempt 1 Output
  try {
    const parsedObj = extractAndParseJson(firstRawOutput);
    const validationResult = OutputSchema.safeParse(parsedObj);

    if (validationResult.success) {
      logCallMetrics({
        promptVersion,
        model: process.env.LLM_MODEL,
        usage: firstUsage,
        durationMs: totalDurationMs,
        repaired: false,
        status: "success",
      });
      return res.status(200).json(validationResult.data);
    } else {
      firstErrorMessage = validationResult.error.issues
        .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
        .join("; ");
    }
  } catch (parseErr) {
    firstErrorMessage = parseErr.message;
  }

  // --- Repair Attempt (Once and only once) ---
  let secondRawOutput = "";
  let secondErrorMessage = "";

  try {
    const { completion: repairCompletion, durationMs: repairDurationMs } = await callModelWithRetry(client, {
      model: process.env.LLM_MODEL || "openrouter/free",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
        { role: "assistant", content: firstRawOutput },
        {
          role: "user",
          content: `Your previous answer was rejected for this reason: ${firstErrorMessage}. Return only corrected JSON matching the schema.`,
        },
      ],
    });

    totalDurationMs += repairDurationMs;
    const secondUsage = repairCompletion.usage;
    secondRawOutput = repairCompletion.choices[0]?.message?.content || "";

    const repairedObj = extractAndParseJson(secondRawOutput);
    const secondValidationResult = OutputSchema.safeParse(repairedObj);

    if (secondValidationResult.success) {
      const combinedUsage = {
        prompt_tokens: (firstUsage?.prompt_tokens || 0) + (secondUsage?.prompt_tokens || 0),
        completion_tokens: (firstUsage?.completion_tokens || 0) + (secondUsage?.completion_tokens || 0),
        total_tokens: (firstUsage?.total_tokens || 0) + (secondUsage?.total_tokens || 0),
      };

      logCallMetrics({
        promptVersion,
        model: process.env.LLM_MODEL,
        usage: combinedUsage,
        durationMs: totalDurationMs,
        repaired: true,
        status: "success",
      });
      return res.status(200).json(secondValidationResult.data);
    } else {
      secondErrorMessage = secondValidationResult.error.issues
        .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
        .join("; ");
    }
  } catch (err) {
    totalDurationMs += err.durationMs || 0;
    secondErrorMessage = err.message;
  }

  // --- Failure & Quarantine (422 Unprocessable Entity) ---
  logToQuarantine({
    input: parseResult.data.text,
    error: secondErrorMessage || firstErrorMessage,
    rawOutput: secondRawOutput || firstRawOutput,
    promptVersion,
  });

  logCallMetrics({
    promptVersion,
    model: process.env.LLM_MODEL,
    usage: firstUsage,
    durationMs: totalDurationMs,
    repaired: true,
    status: "failed",
    error: secondErrorMessage || firstErrorMessage,
  });

  return res.status(422).json({
    error: "Model output failed schema validation after repair attempt",
    details: secondErrorMessage || firstErrorMessage,
    promptVersion,
  });
};

router.post("/classify", handleClassify);
router.post("/report", handleClassify);

export default router;
