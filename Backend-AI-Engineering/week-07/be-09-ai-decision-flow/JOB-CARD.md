# Job Card: AI Decision Flow (BE-09)

**What it does (one sentence):**
Orchestrates an interactive visual AI workflow where every decision node prompts an LLM for a strict binary YES/NO decision, dynamically traversed and durably executed via Inngest steps, and rendered in real time with React Flow.

---

### Contract Specifications

- **Input:**
  ```json
  {
    "workflowId": "string (optional)",
    "workflowName": "string",
    "nodes": [
      {
        "id": "decision-1",
        "type": "start | decision | action",
        "position": { "x": 260, "y": 170 },
        "data": {
          "label": "Billing Classifier",
          "prompt": "Is this message related to a billing or payment issue?"
        }
      }
    ],
    "edges": [
      {
        "id": "e-dec1-yes",
        "source": "decision-1",
        "sourceHandle": "yes",
        "target": "action-1",
        "type": "decisionEdge",
        "data": { "condition": "YES" }
      }
    ],
    "inputContext": {
      "text": "string (e.g., customer ticket or query, 1-2000 chars)"
    }
  }
  ```

- **Output:**
  ```json
  {
    "runId": "string",
    "workflowName": "string",
    "status": "completed | failed",
    "path": ["start-1", "decision-1", "action-1"],
    "steps": [
      {
        "stepIndex": 1,
        "nodeId": "decision-1",
        "nodeLabel": "Billing Classifier",
        "nodeType": "decision",
        "prompt": "Is this message related to a billing or payment issue?",
        "decision": "YES | NO",
        "reason": "Clear one-sentence AI explanation",
        "durationMs": 42,
        "timestamp": "ISO-8601 string",
        "status": "completed"
      }
    ],
    "finalNodeId": "action-1",
    "finalAction": "Execute Auto-Refund Approval & Notify Finance",
    "totalDurationMs": 115
  }
  ```

---

### Constraints & Invariants

- **Binary Decision Contract:** Every decision step must evaluate to strictly **YES** or **NO**.
- **Inngest Durability:** Each node maps to a distinct, observable `step.run()` in Inngest.
- **Fail-Safe Fallback:** If LLM API key is absent or provider returns an error, the system must seamlessly fall back to intelligent deterministic simulation so workflows never stall.
- **Graph Safety:** Traversal contains cycle detection (maximum step limit of 25) to prevent infinite loops.
