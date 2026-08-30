# Support Message Classifier API

Support message classification API endpoint built with Express, Zod input validation, OpenRouter LLM integration, repair retry loops, production resilience controls, and structured metrics logging.

## Environment Setup & Operations Controls

### 1. Kill Switch (`LLM_ENABLED=false`)

Instantly disables all outbound model calls during provider outages or billing spikes. The endpoint answers immediately with a safe, deterministic fallback (`503 Service Unavailable`):

```bash
LLM_ENABLED=false npm start
```

Or on Windows PowerShell:

```powershell
$env:LLM_ENABLED="false"; npm start
```

### 2. Stub Mode (`LLM_STUB=1`)

Skips LLM model calls during local development / server restarts, returning hard-coded schema-compliant JSON:

```bash
LLM_STUB=1 npm start
```

### 3. Production Live Mode

To run with live LLM calls (requires `.env` with `LLM_BASE_URL`, `LLM_API_KEY`, and `LLM_MODEL`):

```bash
npm start
```

---

## Production Resilience & SDK Retry Configuration (Stage 4)

- **Timeout**: The OpenAI client is configured with an explicit 30-second timeout (`timeout: 30000`). Requests exceeding 30s fail fast and return **HTTP 504 Gateway Timeout**.
- **SDK Retries Decision**: We explicitly set `maxRetries: 0` on the OpenAI client, delegating retries entirely to our custom exponential backoff wrapper that selectively retries timeouts, `429` (Rate Limits), and `5xx` (Server Errors) while NEVER retrying `400`, `401`, or `403` errors.
- **Exponential Backoff with Jitter**: Retries use 1s, 2s, 4s backoff delays plus random jitter (0-200ms). If a `429` response contains a `Retry-After` header, it is honored directly.
- **Fast Failure on Bad Auth (401)**: Invalid or missing API keys fail immediately without burning quota on useless retry loops.

---

## Cost & Observability Metrics ([`logs/metrics.jsonl`](logs/metrics.jsonl))

Every call emits a single structured JSON log line recording token counts, duration, and repair state:

```json
{
  "timestamp": "2026-08-30T20:17:01.222Z",
  "promptVersion": "v1",
  "model": "openrouter/free",
  "inputTokens": 517,
  "outputTokens": 155,
  "totalTokens": 672,
  "durationMs": 2067,
  "repaired": false,
  "status": "success",
  "error": null
}
```

---

## Output Validation & Trustworthiness Pipeline (Stage 3)

The raw LLM output is treated as untrusted external data and goes through a strict validation pipeline:

```
[Raw LLM Output] ──► [Strip Code Fences & JSON.parse] ──► [Zod OutputSchema.safeParse]
                                                                  │
                                                        ┌─────────┴─────────┐
                                                        │                   │
                                                    (Success)            (Failure)
                                                        │                   │
                                                        ▼                   ▼
                                                  [200 OK JSON]   [Single Repair Retry]
                                                                            │
                                                                  ┌─────────┴─────────┐
                                                                  │                   │
                                                              (Success)            (Failure)
                                                                  │                   │
                                                                  ▼                   ▼
                                                            [200 OK JSON]   [Log quarantine.jsonl]
                                                                                      │
                                                                                      ▼
                                                                            [422 Unprocessable]
```

1. **Extraction**: Strips markdown fences (` ```json ... ``` `) and isolates JSON objects from text.
2. **Schema Validation**: Validates extracted object against Zod `OutputSchema`.
3. **Single Repair Retry**: If initial parse or schema validation fails, makes **one** repair attempt appending the original prompt, broken output, and exact validation error message:
   > `"Your previous answer was rejected for this reason: <error>. Return only corrected JSON matching the schema."`
4. **Clean Failure & Quarantine**: If repair fails, writes the incident to `logs/quarantine.jsonl` (recording `timestamp`, `promptVersion`, `input`, `error`, `rawOutput`) and returns **HTTP 422 Unprocessable Entity**.
5. **No Raw Model Leaks**: Raw model strings are never returned to callers.

---

## System Prompt Specification

The system prompt is versioned in code under [`prompts/support-classifier-v1.md`](prompts/support-classifier-v1.md).

It follows a 5-part specification structure:
1. **Role and job**: One-sentence domain classification task.
2. **Exact output shape**: Closed lists for `category` (`billing` | `bug` | `feature` | `other`) and `urgency` (`low` | `normal` | `high`), bounded `confidence` (0.0 - 1.0), and short `reason`.
3. **Strict rules**: Prohibits category invention, extra fields, preamble, or medical/legal/financial advice.
4. **Unsure handling**: Defaults to category `"other"` with low confidence (< 0.5) when ambiguous.
5. **Few-shot examples**: Typical, ambiguous, and hostile prompt injection examples.

---

## Endpoint Testing cURL Commands

### 1. Valid Request Example (`200 OK`)

```bash
curl -X POST http://localhost:3000/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "My payment failed when trying to upgrade my subscription."}'
```

### 2. Deliberately Broken Request Example (`400 Bad Request`)

```bash
curl -X POST http://localhost:3000/classify \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'
```
