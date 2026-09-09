# Your First Background Job (BE-06)

A resilient, event-driven background job system and scheduled task runner built with **Node.js**, **Express**, and **Inngest**.

This project implements the foundational asynchronous backend architecture: **Accept fast (202 Accepted), work in the background, report status (eventual consistency), and automate maintenance on a clock (cron schedules).**

---

## 1. Architecture & The Big Idea

When an API endpoint performs heavy operations (such as generating PDF/SEO audits, AI inference, or media processing), keeping a client request hanging causes timeouts, retries, and duplicated work.

This system divides work into three distinct execution patterns:

| Pattern | Example | Trigger Mechanism | Latency Profile |
|---|---|---|---|
| **Request / Response** | `GET /health` | Client HTTP request | Immediate (~2ms) |
| **Background Job** | `POST /reports` -> `make-report` | Domain Event (`report/requested`) | Fast 202 (~50ms), background work (~8s) |
| **Cron Job** | `heartbeat` | Clock Schedule (`* * * * *`) | Scheduled (every minute, no HTTP client) |

---

## 2. Quick Start: Two Commands

### Prerequisites
- Node.js 18+ (tested on Node.js 26)
- npm

### Installation
```bash
npm install
```

### Running the System

Start the API server and the Inngest Dev Server in two separate terminals:

#### Terminal 1: API Server
```bash
npm start
```
*The Express server listens on `http://localhost:3000` with Inngest endpoints served at `/api/inngest`.*

#### Terminal 2: Inngest Dev Server
```bash
npx inngest-cli@latest dev -u http://localhost:3000/api/inngest
```
*The Inngest Dev Server dashboard runs at `http://localhost:8288` with automatic SDK auto-discovery and visual execution tracking.*

---

## 3. Endpoints & Background Functions

### HTTP Endpoints

| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/health` | Liveness health check | `200 OK` |
| `POST` | `/reports` | Request report generation (Fast Door) | `202 Accepted` / `400 Bad Request` |
| `GET` | `/reports/:id` | Status check / Polling endpoint | `200 OK` / `404 Not Found` |
| `GET` | `/reports` | Control Panel (List all reports) | `200 OK` |
| `ALL` | `/api/inngest` | Inngest function runner & discovery endpoint | `200 OK` |

### Inngest Functions

| Function ID | Trigger | Behavior | Resilience & Controls |
|---|---|---|---|
| `say-hello` | `test/hello` | Sleeps 5 seconds, returns `"Hello from the background!"` | Stage 1 smoke test |
| `make-report` | `report/requested` | Step 1: `step.sleep("8s")`<br>Step 2: `step.run("build-report")` | `retries: 2`, `concurrency: 2`, Idempotent |
| `heartbeat` | Cron `* * * * *` | Aggregates and logs counts of `pending`, `done`, `failed` reports | Triggered on the clock alone |

---

## 4. Verification Proofs & Execution Logs

### A. Stage 2: The Fast Door (202 Accepted + Polling Proof)

POST `/reports` responds in milliseconds, while the background job executes durably:

```bash
$ curl -i -X POST http://localhost:3000/reports \
  -H "Content-Type: application/json" \
  -d '{"topic":"cats"}'
```
```http
HTTP/1.1 202 Accepted
Content-Type: application/json; charset=utf-8
Content-Length: 55

{"id":"d5211af9-a75b-4a19-a1cd-598d296f1e79","status":"pending"}
```

#### Immediate Poll (T+0s):
```bash
$ curl -i http://localhost:3000/reports/d5211af9-a75b-4a19-a1cd-598d296f1e79
```
```json
{
  "id": "d5211af9-a75b-4a19-a1cd-598d296f1e79",
  "topic": "cats",
  "status": "pending",
  "createdAt": "2026-09-09T11:55:16.996Z"
}
```

#### Eventual Consistency Poll (~10s later):
```bash
$ curl -i http://localhost:3000/reports/d5211af9-a75b-4a19-a1cd-598d296f1e79
```
```json
{
  "id": "d5211af9-a75b-4a19-a1cd-598d296f1e79",
  "topic": "cats",
  "status": "done",
  "createdAt": "2026-09-09T11:55:16.996Z",
  "result": "Comprehensive report for topic: cats. Generated at 2026-09-09T11:55:25.302Z",
  "completedAt": "2026-09-09T11:55:25.302Z"
}
```

---

### B. Stage 3: Retries, Backoff & Bad Input Rejection

#### 1. Rejecting Bad Input at the Door (400 Bad Request)
```bash
$ curl -i -X POST http://localhost:3000/reports \
  -H "Content-Type: application/json" \
  -d '{}'
```
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
Content-Length: 28

{"error":"Topic is required"}
```
*Notice: No event is published to Inngest when input validation fails.*

#### 2. Simulated Failure & Exponential Backoff (`topic: "fail"`)
When `topic: "fail"` is passed, `make-report` throws `"The report oven is broken!"`. With `retries: 2`, Inngest attempts execution 3 times (1 initial attempt + 2 retries) with progressive backoff delays before marking the run as Failed:

```text
Attempt 1 (11:56:25Z): Failed with Error: "The report oven is broken!" -> wait (backoff)
Attempt 2 (11:56:33Z): Retried -> Failed with Error: "The report oven is broken!" -> wait (backoff)
Attempt 3 (11:56:48Z): Retried -> Failed with Error: "The report oven is broken!" -> Run status: Failed
```

#### Stage 3 Architectural Principle:
> **Wrong Input vs. Wrong Moment:** A wrong input must be rejected at the door with `400 Bad Request` because invalid data will never succeed no matter how many times it is retried; only a "wrong moment" (transient network hiccup, locked database row, or temporary third-party API outage) deserves an automatic retry with exponential backoff.

---

### C. Stage 4: Cron Heartbeat Runs

The `heartbeat` function runs strictly on the schedule `* * * * *` without any HTTP trigger:

```text
[Heartbeat] Report Summary: 1 pending, 0 done, 0 failed (Total: 1)
[Heartbeat] Report Summary: 0 pending, 1 done, 0 failed (Total: 1)
```

#### Stage 4 Cron Questions Answered:
1. **Which cron expression would run this every day at 08:00?**
   - **`0 8 * * *`** (At minute 0 past hour 8 on every day-of-month, every month, every day-of-week).
2. **Which cron expression would run this every Sunday at 22:00?**
   - **`0 22 * * 0`** (or `0 22 * * 7`, at minute 0 past hour 22 on Sunday).

---

## 5. Stretch Goals & Optional Extras Built

### 1. Idempotency Guard
- **Implementation**: Before executing the slow work step, `make-report` inspects the state of `reports.get(id)`. If `status === "done"`, it immediately exits with `{ note: "Already processed (idempotent)" }` without re-running the generator.
- **Why jobs must survive running twice**: Networks are unreliable and distributed systems guarantee at-least-once event delivery; duplicate event deliveries or network retries are inevitable, so a background job must be idempotent to avoid duplicating side effects (e.g. double-charging credit cards or sending duplicate emails).

### 2. Concurrency Limit
- **Configuration**: Configured `concurrency: [{ limit: 2 }]` on `make-report`.
- **When would you want a queue to be slow?** When downstream services have strict rate limits (such as third-party AI APIs, email gateways, or constrained database connection pools), capping concurrency prevents overwhelming downstream systems and avoiding rate limit errors.

### 3. Outbox File Dispatch (Simulated Email Dispatch)
- When a report completes, the worker writes the finished content to `outbox/<id>.txt` on disk, simulating an asynchronous email or document delivery channel.

### 4. Control Panel Endpoint
- `GET /reports` returns an array of all known reports, their statuses, timestamps, and results.

### 5. Durable Restarts
- **Observation**: When the API process is killed during the 8-second sleep step and restarted, Inngest resumes the workflow directly after the finished sleep step rather than starting over from scratch. Because step boundaries are durably memoized, intermediate work is never lost.

---

## 6. Stage 6: The AI Rematch ("AI vs Me")

### The Prompt Given to the AI
```text
Build an Express API in Node.js using Inngest for background jobs.
It should have:
1. GET /health returning { status: "ok" }
2. POST /reports where client sends { topic: "string" }, saves to an in-memory map with status "pending", triggers background job "make-report" via event "report/requested", and immediately returns 202 { id, status: "pending" }. Reject missing topics with 400.
3. Background function "make-report" that sleeps for 8 seconds, then runs a step to build the report and set status to "done". If topic is "fail", fail the step so Inngest retries it up to 2 times with backoff.
4. GET /reports/:id returning the report or 404 if not found.
5. A cron function "heartbeat" running every minute (* * * * *) logging summary of pending, done, and failed reports.
Serve everything on port 3000 at /api/inngest.
```

The generated code was quarantined into `ai-version/server.js`.

### Side-by-Side Comparison (`git diff --no-index server.js ai-version/server.js`)

| Feature / Aspect | Hand-Built (`server.js`) | AI Version (`ai-version/server.js`) |
|---|---|---|
| **Local Dev Configuration** | Explicit `process.env.INNGEST_DEV = "1"` and `isDev: true` | Missing (fails to send events locally without env key) |
| **Data Storage** | Native `Map` with typed mutations | Plain JS object `{}` with shallow spreading |
| **Idempotency** | Guard clause checking `status === "done"` before work | None (duplicate event restarts processing) |
| **Concurrency Control** | Explicit `concurrency: [{ limit: 2 }]` | Unbounded concurrency |
| **Failure State Tracking** | Updates in-memory record to `status: "failed"` with error message | Throws directly; report stays permanently `"pending"` in API |
| **Input Validation** | Validates presence, type, and non-empty string | Simple truthiness check `if (!topic)` |
| **Outbox Dispatch** | Writes generated report to `outbox/<id>.txt` | Omitted |

### The Three Questions Answered

1. **What did the AI do better — and do you understand it?**
   - The AI generated a very concise implementation using `Object.values(reports).filter(...)` for calculating cron aggregates, which is readable for small in-memory collections.
2. **What did it get wrong or silently ignore?**
   - It silently ignored the Inngest local environment requirements: omitting `isDev: true` / `process.env.INNGEST_DEV = "1"` causes Inngest SDK v3 to default to Cloud mode, throwing an event key error when `inngest.send()` is executed.
   - It threw the error inside `step.run` without updating the report status to `"failed"`. As a result, the polling endpoint `GET /reports/:id` reported `"pending"` forever even after all retries exhausted.
3. **What did your prompt forget to specify — and what did the AI silently decide for you?**
   - The prompt forgot to specify how failure states should be reflected in the status endpoint. The AI silently decided to only let the step throw and let Inngest know, leaving the user-facing status endpoint unaware of the failure.
   - The prompt did not specify idempotency or concurrency limits, so the AI completely omitted them.

### Rematch Improvement
> **Improved Prompt Addition:** *"Ensure `isDev: true` is enabled on the Inngest client for zero-config local dev server routing. In `make-report`, ensure that if the step fails, the report's status in the store is updated to 'failed' with the error message before throwing, and add an idempotency check so already-done reports are not processed twice."*
