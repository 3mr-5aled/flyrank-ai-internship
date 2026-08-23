# FL-06: Agent Design Document – FlyRank Assignment Evaluator & Tutor Agent

> **Assignment Code:** FL-06 | **Track:** General AI Fluency | **Week:** 5  
> **Phase:** Build (core) | **Estimated Build Workload:** 10 Hours  
> **Author:** Amr Khaled Morcy  

---

## 1. Job to Be Done

### Core Objective
The **FlyRank Assignment Evaluator & Tutor Agent** is an autonomous, tool-equipped AI assistant designed to inspect internship assignment submissions, evaluate them against authoritative rubric criteria, generate structured evaluation logs, and provide plain-language tutoring feedback for any failed or missing criteria.

### Scope & Build Time Estimation
* **Estimated Build Time:** ~10 hours.
* **In-Scope:**
  * Reading local assignment specs and submission files (`.md`, `.json`, `.js`, `.txt`).
  * Running automated evaluation criteria verification via local MCP tools.
  * Formulating an Evaluator-Optimizer loop to re-check student drafts before final submission.
  * Saving structured JSON analytics and Markdown review reports to local disk storage.
* **Out-of-Scope:**
  * Automatic submission to external LMS platforms via browser automation.
  * Direct grading modification without human review.

---

## 2. Target User & Usage Pattern

* **Target User:** Amr Khaled (Intern) & Program Mentors.
* **Usage Frequency:** 2–3 times per week when completing internship checkpoints and reviewing deliverables before final portal submission.
* **Interaction Style:** CLI command / Stdio MCP interface with clear evaluation outputs and actionable improvement steps.

---

## 3. Tools and Data Access Plan

To ensure 100% execution reliability, every data source and tool has a direct, realistic access plan:

| Resource / Tool | Type | Data / Action | Realistic Access Plan |
| :--- | :--- | :--- | :--- |
| `read_submission_file` | Local Filesystem Tool | Reads student markdown/code files | Node.js `fs.readFileSync` over stdio MCP server. |
| `list_workspace_files` | Workspace Tool | Scans submission directory structure | Node.js `fs.readdirSync` with glob filtering over MCP. |
| `write_eval_report` | Local File Storage Tool | Saves formatted `.md` evaluation reports | Node.js `fs.writeFileSync` to local `reports/` folder. |
| `calculate_rubric_score` | Analytics Tool | Calculates compliance percentage & pass/revise status | Local JS mathematical aggregation script. |
| `rubric_database` | Knowledge Base | Contains pass/revise criteria for FL-01 through FL-07 and PF-01 through PF-05 | Local JSON file (`rubrics.json`) bundled with the agent. |

---

## 4. Draft System Instructions

```text
You are the FlyRank Assignment Evaluator & Tutor Agent. Your mission is to evaluate internship submissions with technical rigor, strict adherence to pass/revise rubrics, and constructive tutoring feedback.

OPERATIONAL RULES:
1. ALWAYS inspect the student submission file directly using the `read_submission_file` tool before making any evaluation claim. Never guess or hallucinate submission contents.
2. Cross-reference submission evidence against the exact rubric stored in `rubrics.json`.
3. Score each criterion as either [PASS] or [REVISE].
4. If any criterion is marked [REVISE], activate the TUTOR MODE: explain the technical root cause in simple words and provide 2-3 specific, actionable steps to fix it.
5. Generate a final evaluation report and write it to disk using `write_eval_report`.
6. NEVER alter student submission source files or perform destructive git operations.
```

---

## 5. Five Pre-Build Evaluation Cases (Eval Cases)

Before writing implementation code, the agent will be evaluated against five distinct test scenarios:

### Test Case 1: Complete & Passing Submission (FL-05)
* **Input:** `AI-Fluency/week-04/FL-05-Agent-Concepts-and-MCP-Basics/README.md`
* **Expected Result:** Status `PASS` (100% criteria met: essay >600 words, 3 non-chat MCP tasks documented, JSON-RPC stdio proof verified).

### Test Case 2: Incomplete Submission (Word Count Below Threshold)
* **Input:** A test markdown file with only 300 words for an essay requirement of 600–900 words.
* **Expected Result:** Status `REVISE` on word count criterion; Agent explicitly identifies current word count (300) vs required (600) and provides suggestions to expand the analysis.

### Test Case 3: Missing File Artifact
* **Input:** Request to evaluate a non-existent path `week-05/missing_file.md`.
* **Expected Result:** Agent safely catches file-not-found error via MCP tool, halts gracefully, and prompts user for correct path without crashing.

### Test Case 4: Formatting & Code Block Validation (PF-04 DNS Walkthrough)
* **Input:** `AI-Fluency/week-05/PF-04-Personal-Website-and-DNS-Walkthrough/DNS_Walkthrough.md`
* **Expected Result:** Status `PASS` (Explains DNS resolver, root, TLD, authoritative nameserver, CNAME alias, and HTTPS).

### Test Case 5: Evaluator-Optimizer Reflection Loop
* **Input:** Submission draft missing a mandatory section (e.g., missing Guardrails in FL-06).
* **Expected Result:** Evaluator scores draft at 80% (`REVISE`), triggers optimizer loop, highlights missing guardrails section, and generates draft outline for missing section.

---

## 6. Risks and Guardrails

To prevent unwanted side effects, the agent is bounded by strict operational boundaries:

| Risk Level | Action Type | Guardrail Protocol |
| :--- | :--- | :--- |
| **High / Irreversible** | Overwriting original student submission source code | **STRICTLY FORBIDDEN.** The agent can only read student code and write output reports into a separate `reports/` directory. |
| **Medium** | Generating report files on disk | **AUTOMATED WITH AUDIT.** Writes reports to explicit output paths (`evaluation_report.md`). |
| **Medium** | False Positive PASS assessment | **DUAL-CHECK EVALUATOR.** Requires exact string pattern matching or quantitative metric validation (e.g. word count regex, JSON schema validation). |
| **Low** | Displaying terminal logs | Output formatted clean Markdown to console. |

---

## 7. Platform Choice & Justification

### Selected Platform: **Scripted Node.js / TypeScript Agent with Stdio MCP Interface**

### Comparison Against Alternative Platforms:

| Criteria | Scripted Node.js + MCP Agent (Chosen) | Claude Custom GPT / Web Agent | n8n Workflow |
| :--- | :--- | :--- | :--- |
| **Local File Access** | Direct, deterministic via Node.js stdio MCP | Requires manual file uploads | Requires custom webhook tunneling |
| **Custom Eval Logic** | Full JavaScript program control & JSON-RPC schema | Limited to prompt-based heuristics | Visual nodes, harder complex loops |
| **Build Time & Cost** | 0$ cost, ~8-10h build time | Requires paid ChatGPT Plus/Team | Requires hosting server setup |
| **Reproducibility** | Version-controlled in Git repository | Locked inside third-party UI | Exported JSON files |

**Justification:** The Scripted Node.js + stdio MCP server architecture provides complete offline reproducibility, direct filesystem access without cloud middleware, 0$ operational cost, and direct reuse of the protocol code established in `FL-05`.

---
*Submitted for FlyRank Internship Assignment FL-06.*
