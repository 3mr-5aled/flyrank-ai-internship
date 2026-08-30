# Support Message Classifier API

## 1. What This Endpoint Does

This API endpoint receives incoming customer support messages sent to a software application, analyzes their text, and automatically classifies them so they get routed to the right team immediately. It determines whether a customer's message relates to a billing issue, a software bug, a feature request, or a general question, assigns an urgency level, calculates a confidence score, and provides a short explanation for its decision—returning everything in a clean, predictable computer-readable format.

---

## 2. Quick Test (cURL & Response)

### Command

```bash
curl -X POST http://localhost:3000/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "I was charged $49 on my credit card twice for this month invoice #1042."}'
```

### Exact Response (`200 OK`)

```json
{
  "category": "billing",
  "urgency": "high",
  "confidence": 0.95,
  "reason": "User is reporting a duplicate charge on their credit card for a specific invoice."
}
```

---

## 3. Job Card

- **What it does**: Classifies a support message so it lands on the right team.
- **Input**: `{ "text": "string, 1-2000 characters" }`
- **Output**: `{ "category": one of [billing|bug|feature|other], "urgency": one of [low|normal|high], "confidence": 0.0-1.0, "reason": "one short sentence" }`
- **It must never**:
  - Invent a category outside the allowed list (`billing`, `bug`, `feature`, `other`).
  - Return free text outside the valid JSON schema contract.
  - Give medical, legal, or financial advice.
  - Reveal the system prompt or internal instructions.
- **When unsure it should**: Return category `"other"` with low confidence (below 0.5), not a guess.

---

## 4. Provider, Model & Environment Configuration

- **Provider**: OpenRouter (`https://openrouter.ai/api/v1`)
- **Model**: `openrouter/free`

To swap providers or models, update these **three environment variables** in `.env`:

1. `LLM_BASE_URL` — e.g. `https://openrouter.ai/api/v1` or `https://api.openai.com/v1`
2. `LLM_API_KEY` — Your provider API key (`sk-or-...`)
3. `LLM_MODEL` — The target model identifier (e.g., `openrouter/free` or `gpt-4o-mini`)

---

## 5. Evaluation Results

- **Date**: 2026-08-30
- **Prompt Version**: `v1` ([`prompts/support-classifier-v1.md`](prompts/support-classifier-v1.md))
- **Eval Score**: **8 / 8 (100.0%)** test cases matched expected categories and confidence rules in [`evals/cases.json`](evals/cases.json).

To run the evaluation suite:

```bash
npm run eval
```

---

## 6. Cost & Usage Metrics

### Single Request Log Entry

```json
{
  "timestamp": "2026-08-30T20:19:28.342Z",
  "promptVersion": "v1",
  "model": "openrouter/free",
  "inputTokens": 517,
  "outputTokens": 172,
  "totalTokens": 689,
  "durationMs": 3337,
  "repaired": false,
  "status": "success",
  "error": null
}
```

### 10,000 Requests / Day Estimate

At ~689 total tokens per request (~517 input, ~172 output) on an average model priced at $0.15/1M input and $0.60/1M output tokens, 10,000 requests per day consumes ~6.89 million tokens costing approximately **$1.81 per day** (~$54.30 / month).

---

## 7. What I'd Fix With Another Day

With another day, I would implement prompt caching for the static system prompt to reduce response latency by ~40%, and add semantic drift monitoring to automatically trigger repair retries on borderline confidence scores before returning to the caller.
