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
  });
};

function extractAndParseJson(rawText) {
  if (typeof rawText !== "string") {
    throw new SyntaxError("Model output is not a string");
  }

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = rawText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1").trim();

  // Locate the first '{' and last '}' to extract object payload
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
    console.error("Failed to write to quarantine log:", err);
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

  // Stub mode
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

  try {
    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || "openrouter/free",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    firstRawOutput = completion.choices[0]?.message?.content || "";
    const parsedObj = extractAndParseJson(firstRawOutput);
    const validationResult = OutputSchema.safeParse(parsedObj);

    if (validationResult.success) {
      return res.status(200).json(validationResult.data);
    } else {
      firstErrorMessage = validationResult.error.issues
        .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
        .join("; ");
    }
  } catch (err) {
    firstErrorMessage = err.message;
  }

  // --- Repair Attempt (Once and only once) ---
  let secondRawOutput = "";
  let secondErrorMessage = "";

  try {
    const repairCompletion = await client.chat.completions.create({
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

    secondRawOutput = repairCompletion.choices[0]?.message?.content || "";
    const repairedObj = extractAndParseJson(secondRawOutput);
    const secondValidationResult = OutputSchema.safeParse(repairedObj);

    if (secondValidationResult.success) {
      return res.status(200).json(secondValidationResult.data);
    } else {
      secondErrorMessage = secondValidationResult.error.issues
        .map((i) => `${i.path.join(".") || "root"}: ${i.message}`)
        .join("; ");
    }
  } catch (err) {
    secondErrorMessage = err.message;
  }

  // --- Failure & Quarantine (422 Unprocessable Entity) ---
  logToQuarantine({
    input: parseResult.data.text,
    error: secondErrorMessage || firstErrorMessage,
    rawOutput: secondRawOutput || firstRawOutput,
    promptVersion,
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
