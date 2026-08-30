import express from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { InputSchema, STUB_RESPONSE } from "./llm/schema.js";

const router = express.Router();

const promptPath = path.join(process.cwd(), "prompts", "support-classifier-v1.md");

const getOpenAIClient = () => {
  if (!process.env.LLM_API_KEY) return null;
  return new OpenAI({
    baseURL: process.env.LLM_BASE_URL || "https://openrouter.ai/api/v1",
    apiKey: process.env.LLM_API_KEY,
  });
};

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

  // Stub mode check
  if (process.env.LLM_STUB === "1" || process.env.LLM_STUB === "true") {
    return res.status(200).json(STUB_RESPONSE);
  }

  const client = getOpenAIClient();
  if (!client) {
    return res.status(200).json(STUB_RESPONSE);
  }

  try {
    const systemPrompt = fs.readFileSync(promptPath, "utf-8");
    // Secure JSON-encoding of user input to protect against prompt injection
    const userContent = JSON.stringify({ text: parseResult.data.text });

    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || "openrouter/free",
      temperature: 0,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content || "";
    const cleanedContent = rawContent.replace(/```json\s*|\s*```/g, "").trim();

    try {
      const parsedJson = JSON.parse(cleanedContent);
      return res.status(200).json(parsedJson);
    } catch {
      return res.status(200).json({ rawResponse: rawContent });
    }
  } catch (error) {
    return res.status(500).json({
      error: "LLM call failed",
      details: error.message,
    });
  }
};

router.post("/classify", handleClassify);
router.post("/report", handleClassify);

export default router;
