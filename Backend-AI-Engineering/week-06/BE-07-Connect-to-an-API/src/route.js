import express from "express";
import { InputSchema, OutputSchema, STUB_RESPONSE } from "./llm/schema.js";

const router = express.Router();

const handleClassify = (req, res) => {
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

  // If stub mode is active (or by default in Stage 1), skip model and return stub object
  if (process.env.LLM_STUB === "1" || process.env.LLM_STUB === "true" || !process.env.LLM_API_KEY) {
    return res.status(200).json(STUB_RESPONSE);
  }

  // Stub response for Stage 1 before AI implementation
  return res.status(200).json(STUB_RESPONSE);
};

router.post("/classify", handleClassify);
router.post("/report", handleClassify);

export default router;
