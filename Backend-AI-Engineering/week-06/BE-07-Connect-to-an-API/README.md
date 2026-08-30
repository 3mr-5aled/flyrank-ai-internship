# Support Message Classifier API

Support message classification API endpoint built with Express and Zod input validation.

## Environment Setup & Stub Mode

To run in **Stub Mode** (skips LLM model calls and returns hard-coded schema-compliant JSON response):

```bash
LLM_STUB=1 npm start
```

Or on Windows PowerShell:

```powershell
$env:LLM_STUB="1"; npm start
```

Default server runs at `http://localhost:3000`.

---

## Endpoint Testing

### 1. Valid Request Example (Returns `200 OK`)

```bash
curl -X POST http://localhost:3000/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "My payment failed when trying to upgrade my subscription."}'
```

**Expected Response (`200 OK`):**

```json
{
  "category": "billing",
  "urgency": "normal",
  "confidence": 0.95,
  "reason": "User issue relates to payment processing."
}
```

---

## 2. Deliberately Broken Request Example (Returns `400 Bad Request`)

```bash
curl -X POST http://localhost:3000/classify \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'
```

**Expected Response (`400 Bad Request`):**

```json
{
  "error": "Validation error",
  "field": "text",
  "message": "text field must not be empty",
  "issues": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "inclusive": true,
      "exact": false,
      "message": "text field must not be empty",
      "path": ["text"]
    }
  ]
}
```
