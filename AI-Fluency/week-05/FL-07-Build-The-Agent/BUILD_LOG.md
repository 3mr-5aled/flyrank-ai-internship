# FL-07: Agent Build Log – FlyRank Assignment Evaluator & Tutor Agent

> **Assignment Code:** FL-07 | **Track:** General AI Fluency | **Week:** 5  
> **Phase:** Build | **Estimated Workload:** 10 Hours  
> **Author:** Amr Khaled Morcy  

---

## 1. System Architecture Overview

The **FlyRank Assignment Evaluator & Tutor Agent** was implemented as a scripted Node.js application utilizing stdio tool interfaces, automated rubric checking algorithms, and an Evaluator-Optimizer reflection loop.

```
+-------------------------------------------------------------------+
|                   CLI Driver / Stdio Connector                    |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|               MCP Tool: readSubmissionFile(filePath)              |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|             Evaluator Engine (Rubric Compliance Check)            |
|  - Word Count Verification                                        |
|  - Technical Keyword Presence                                     |
|  - Required Section Headings                                      |
+-------------------------------------------------------------------+
                                  |
                                  +------------+
                                  |            |
                             (Pass 100%)    (Fail < 100%)
                                  |            |
                                  v            v
+-------------------------------------------------------------------+
|                     Optimizer Reflection Loop                     |
|  - Generate Pass Certificate     | - Generate Remediation Steps   |
|                                  | - Highlight Missing Headings   |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|               MCP Tool: writeEvalReport(outputPath)               |
+-------------------------------------------------------------------+
                                  |
                                  v
[ Output Report Saved: reports/<code >_evaluation_report.md ]
```

---

## 2. Iteration Chronology & Bugs Encountered

### Iteration 1: Initial Stdio Tool Implementation
* **Goal:** Implement file reading tool and word count calculation algorithm.
* **Bug Encountered:** Initial string split on spaces (`content.split(' ')`) miscounted multiple consecutive spaces and newline characters (`\n`), distorting total word counts by ~15%.
* **Fix Applied:** Replaced simple split with regex tokenization (`content.trim().split(/\s+/).filter(w => w.length > 0)`).

### Iteration 2: Rubric Evaluation & Keyword Matching
* **Goal:** Verify presence of mandatory technical keywords specified in assignment rubrics.
* **Bug Encountered:** Case-sensitive keyword comparison caused valid submissions containing capitalized headings (e.g. `Five Pre-Build Evaluation Cases`) to fail criteria checking against lower-case rubric keys (`eval cases`).
* **Fix Applied:** Normalized both document content and rubric keys to lower-case string matching (`content.toLowerCase().includes(kw.toLowerCase())`).

### Iteration 3: Evaluator-Optimizer Loop Demonstration
* **Goal:** Verify that the agent detects missing elements, provides tutoring remediation steps, and achieves 100% compliance after fixing.
* **Empirical Test:**
  1. **Run 1:** Ran `node agent.js FL-06` against draft design doc. Score: **[REVISE] (67%)** due to missing explicit key phrase `"eval cases"`.
  2. **Remediation:** Added phrase to section 5 header.
  3. **Run 2:** Re-ran `node agent.js FL-06`. Score: **[PASS] (100%)**.

---

## 3. Deviations from FL-06 Spec & Justifications

| Spec Requirement | Actual Implementation | Reason for Deviation |
| :--- | :--- | :--- |
| External HTTP API Call | Local Stdio MCP file system tools | Prioritized zero external network dependencies and 100% deterministic offline execution speed. |
| Multi-file Batch Loop | Single target file CLI driver with module export | Kept interface clean while allowing module import for batch processing scripts. |

---

## 4. Verification Command & Empirical Output

### Terminal Command:
```powershell
node agent.js FL-06 "D:\03-Career\02-Internships\Flyrank AI Intern\Assignments\flyrank-ai-internship\AI-Fluency\week-05\FL-06-Design-Your-Personal-Agent\FL-06_Agent_Design_Doc.md"
```

### Clean Execution Log:
```text
=========================================================
   FLYRANK EVALUATOR AGENT: STARTING EVALUATION
=========================================================
[AGENT TOOL] Reading file: D:\03-Career\02-Internships\Flyrank AI Intern\Assignments\flyrank-ai-internship\AI-Fluency\week-05\FL-06-Design-Your-Personal-Agent\FL-06_Agent_Design_Doc.md
[AGENT EVALUATOR] Content loaded. Total Words: 1032
[AGENT OPTIMIZER] Overall Status: [PASS] (100%)
[AGENT TOOL] Written evaluation report to: D:\03-Career\02-Internships\Flyrank AI Intern\Assignments\flyrank-ai-internship\AI-Fluency\week-05\FL-07-Build-The-Agent\reports\FL-06_evaluation_report.md
=========================================================
```

---
*Submitted for FlyRank Internship Assignment FL-07.*
