# FlyRank AI Internship — Assignments & Capstone Portfolio

<div align="center">

[![Internship Completed](https://img.shields.io/badge/FlyRank_AI_Internship-Completed_%26_Approved-success?style=for-the-badge&logo=checkmarx)](https://internship.flyrank.ai/verify?id=FR-D11-0A358-5D8C2)
[![Certificate ID](https://img.shields.io/badge/Certificate_ID-FR--D11--0A358--5D8C2-blue?style=for-the-badge)](https://internship.flyrank.ai/verify?id=FR-D11-0A358-5D8C2)
[![Evaluation Report](https://img.shields.io/badge/Evaluation_Report-FR--D8--313B4--69F3D-teal?style=for-the-badge)](https://internship.flyrank.ai/verify?id=FR-D8-313B4-69F3D)
[![Recommendation Letter](https://img.shields.io/badge/Recommendation_Letter-FR--D10--4B9AF--BA6BE-purple?style=for-the-badge)](https://internship.flyrank.ai/verify?id=FR-D10-4B9AF-BA6BE)
[![Capstone](https://img.shields.io/badge/Capstone-TaxShield_MENA-orange?style=for-the-badge&logo=shield)](https://github.com/3mr-5aled/flyrank-capstone-taxshield-mena)

**Amr Khaled Morcy** — Back-End AI Engineering Intern  
*July 1, 2026 – September 16, 2026* • **FlyRank Corp.** (Wyoming, USA)  
**Supervisor of Record:** Arijana Ibrović (Director of Internship Program) • **Program Approval:** Alen Malkoc (Founder & CEO)

</div>

---

## 🌟 Executive Summary & Program Completion

This repository houses the complete assignment portfolio and technical deliverables for the **FlyRank AI Internship Program (July–September 2026)**. 

The internship was successfully completed with formal supervisor approval and program sign-off, **independently qualifying in both tracks**:
1. **Backend AI Engineering Track** (Primary Specialization — 9/5 core assignments + bonus ORM implementations, culminating in the **Your 10x Solution** Capstone).
2. **AI Fluency Track** (23/5 core assignments across workflow engineering, prompting architectures, agent systems, and portfolio deployment, culminating in the **General AI Fluency Impact Project**).

### Verified Completion Ledger

| Metric | Program Record | Description & Verification Source |
|---|---|---|
| **Total Reported Time** | **248.6 Estimated Hours** | Documented ledger across assignments, capstone, meetings, resources & courses |
| **Practical Assignments** | **32 Completed** | 139.5 estimated hours across Backend & AI Fluency tracks |
| **Capstone Projects** | **2/2 Accepted** | 20.0 estimated hours (TaxShield MENA + AI Fluency Impact Project) |
| **Live Events & Workshops** | **32 Attended** | 45.1 estimated hours covering system architecture, RAG, auth, agentic risk |
| **Curated Learning Resources** | **15 Completed** | 16.0 estimated hours (PostgreSQL, Docker, HTTP, OpenAPI, Node.js) |
| **Anthropic Academy Courses** | **14 Verified Courses** | 28.0 estimated hours (AI Fluency, MCP Advanced, Subagents, Claude Code) |
| **Final Review Status** | **Approved & Signed** | Issued September 15–16, 2026 by FlyRank CEO Alen Malkoc |

### Official Verification Links
- 📜 **Certificate of Completion**: [Verify Certificate `FR-D11-0A358-5D8C2`](https://internship.flyrank.ai/verify?id=FR-D11-0A358-5D8C2)
- 📊 **Final Internship Report & Evaluation**: [Verify Final Evaluation `FR-D8-313B4-69F3D`](https://internship.flyrank.ai/verify?id=FR-D8-313B4-69F3D)
- ✉️ **Executive Recommendation Letter**: [Verify Recommendation `FR-D10-4B9AF-BA6BE`](https://internship.flyrank.ai/verify?id=FR-D10-4B9AF-BA6BE)
- 📈 **Detailed Activity & Progress Report**: [Verify Progress Report `FR-D7-3086F-E851B`](https://internship.flyrank.ai/verify?id=FR-D7-3086F-E851B)

---

## 🛡️ Culminating Capstone Project: TaxShield MENA

The culminating project for the Backend AI Engineering specialization is **[TaxShield MENA](https://github.com/3mr-5aled/flyrank-capstone-taxshield-mena)** (*"Your 10x Solution"*).

[![TaxShield MENA Repo](https://img.shields.io/badge/GitHub_Repository-TaxShield_MENA-181717?style=for-the-badge&logo=github)](https://github.com/3mr-5aled/flyrank-capstone-taxshield-mena)

### The 10x Pitch
> *"Manually auditing 200 supplier invoices takes an enterprise finance team 2 full business days. **TaxShield MENA** audits the entire batch, catches tax fraud & arithmetic anomalies with dual-layer AI, and exports an executive tax audit PDF in under 60 seconds."*

### Key System Highlights
- **Dual-Layer Audit Architecture**:
  - **Layer 1 (Deterministic Code Engine)**: Subtotal/VAT reconciliation, 15% KSA / 14% Egyptian VAT compliance, 15-digit Saudi TIN and 9-digit Egyptian tax ID verification, and ZATCA Phase 2 Base64 TLV QR code validation.
  - **Layer 2 (Gemini AI Semantic Engine)**: Arabic expense parsing, detection of disguised personal luxury purchases (e.g. Rolex watches masked under office supplies), and illegal CapEx write-offs disguised as OpEx.
- **Production Stack**: Node.js / TypeScript, Express REST API, Prisma ORM (SQLite / PostgreSQL), Google Gemini Flash 1.5, PDFKit executive audit reporter, Zod boundary validation.
- **Asynchronous Batch Processing**: Background queue with percentage-based status polling (`0%` $\rightarrow$ `100%`) returning clean `202 Accepted` responses.
- **Financial Telemetry & Token Costing**: Real-time per-call token consumption and USD expense tracking.
- **Automated Verification**: Complete automated test suites: 13 unit/integration tests (`npm test`) and 19/19 end-to-end HTTP route tests (`npm run test:routes`).

---

## 📂 Repository Layout & Weekly Progress

The repository is organized into two primary tracks:
```text
flyrank-ai-internship/
├── AI-Fluency/
│   ├── week-01/
│   ├── week-02/
│   ├── week-03/
│   ├── week-04/
│   ├── week-05/
│   ├── week-06/
│   └── week-07/
├── Backend-AI-Engineering/
│   ├── week-02/
│   ├── week-03/
│   ├── week-04/
│   ├── week-05/
│   ├── week-06/
│   └── week-07/
├── LICENSE
└── README.md
```

---

## 🛠️ Track 1: Backend AI Engineering

The Backend track focuses on building scalable, resilient, event-driven web services, database architectures, background queues, and production LLM integrations.

| Week | Assignment Folder | Focus & Deliverables | Core Technologies |
|---|---|---|---|
| **Week 2** | [`week-02/A1-Build-your-first-CRUD-API`](./Backend-AI-Engineering/week-02/A1-Build-your-first-CRUD-API/) | **Build Your First CRUD API**: Evolution from single-file monolithic script (`oneFile`) to production clean layered architecture (`Layered-architecture`: controllers, services, routes, models) and AI-assisted iteration (`ai-version`). | Node.js, Express, REST API |
| **Week 3** | [`week-03/A2-Connecting-to-the-database`](./Backend-AI-Engineering/week-03/A2-Connecting-to-the-database/) | **Connecting to the Database**: Relational persistence with PostgreSQL, connection pooling, schema migrations, and parameterized query safety (comparing manual vs. AI implementations). | Node.js, PostgreSQL, `pg` |
| **Week 3** | [`week-03/A3-Containerize-your-stack`](./Backend-AI-Engineering/week-03/A3-Containerize-your-stack/) | **Containerize Your Stack**: Multi-stage Docker packaging, `docker-compose` multi-container orchestration (API + PostgreSQL), volume persistence, and container healthchecks. | Docker, Docker Compose, Alpine |
| **Week 3** | [`week-03/Extra-using_ORM`](./Backend-AI-Engineering/week-03/Extra-using_ORM/) | **Bonus: ORM Exploration**: Model-driven database persistence using SQLite and PostgreSQL ORM implementations, schema migrations, and relational abstractions. | Prisma / Sequelize, SQLite, PostgreSQL |
| **Week 4** | [`week-04/Auth-Login-protect`](./Backend-AI-Engineering/week-04/Auth-Login-protect/) | **Auth - Login & Protect**: Secure stateless authentication pipeline with bcrypt password hashing, JSON Web Token (JWT) issuance, and middleware guard protecting private routes. | JWT, Bcrypt, Express Middleware |
| **Week 5** | [`week-05/The-polite-scraper`](./Backend-AI-Engineering/week-05/The-polite-scraper/) | **The Polite Scraper**: Robust, polite web crawler for sandbox data (`books.toscrape.com`) with robots.txt adherence, exponential backoff, concurrency throttling, and cache invalidation. | Node.js, Cheerio, Axios |
| **Week 6** | [`week-06/BE-07-Connect-to-an-API`](./Backend-AI-Engineering/week-06/BE-07-Connect-to-an-API/) | **Connect to an AI API**: Production LLM integration via Google Gemini API, support message classification (`billing`, `bug`, `feature`, `other`), strict JSON schema outputs, and automated eval suites. | Google Gemini API, JSON Schema, Node.js |
| **Week 7** | [`week-07/be-06-first-background-job`](./Backend-AI-Engineering/week-07/be-06-first-background-job/) | **First Background Job**: Event-driven asynchronous execution engine using Inngest & Express (`202 Accepted` pattern, durable execution, eventual consistency polling, and automated cron runners). | Node.js, Express, Inngest |
| **Week 7** | [`week-07/be-08-pdf-report-generator`](./Backend-AI-Engineering/week-07/be-08-pdf-report-generator/) | **Automated PDF Report Generator**: Production data-to-document pipeline using SQLite native aggregations, Playwright headless Chromium A4 PDF rendering, print CSS page-break rules, and static linking. | Node.js, SQLite, Playwright, HTML/CSS |
| **Week 7** | [`week-07/be-09-ai-decision-flow`](./Backend-AI-Engineering/week-07/be-09-ai-decision-flow/) | **AI Decision Flow with React Flow + Inngest**: Interactive visual node-based decision graph engine built with Next.js App Router, `@xyflow/react`, Inngest durable steps, and AI conditional branching. | Next.js, React Flow, Inngest, Tailwind CSS |

---

## 🧠 Track 2: General AI Fluency

The AI Fluency track develops applied prompt engineering, autonomous agent design, Model Context Protocol (MCP) tooling, developer portfolio architecture, and production deployment.

| Week | Assignment Folder | Focus & Deliverables |
|---|---|---|
| **Week 1** | [`week-01/AI-Workflow-Audit-and-Tool-Setup`](./AI-Fluency/week-01/AI-Workflow-Audit-and-Tool-Setup/) | **AI Workflow Audit**: Environment setup, developer tooling inventory, CLI optimization, and terminal workflow audit. |
| **Week 1** | [`week-01/Draw-the-Path-Portfolio-Sitemap-Toolkit`](./AI-Fluency/week-01/Draw-the-Path-Portfolio-Sitemap-Toolkit/) | **Draw the Path**: Portfolio information architecture, technical sitemap, tech stack evaluation, and prompt pressure-testing. |
| **Week 1** | [`week-01/What-Are-You-Proving`](./AI-Fluency/week-01/What-Are-You-Proving/) | **What Are You Proving?**: Defining the core engineering narrative, technical strengths, and verifiable proof of competence. |
| **Week 2** | [`week-02/Frame-It-as-Cases-Work-That-Speaks-for-Itself`](./AI-Fluency/week-02/Frame-It-as-Cases-Work-That-Speaks-for-Itself/) | **Frame It as Cases**: Transforming projects into high-signal case studies with context, technical obstacles, and measurable impact. |
| **Week 2** | [`week-02/Prompting-Fundamentals-on-Real-Tasks-v2`](./AI-Fluency/week-02/Prompting-Fundamentals-on-Real-Tasks-v2/) | **Prompting Fundamentals on Real Tasks**: Systematic prompt iteration logs, input-output pairing, and comparative evaluation. |
| **Week 2** | [`week-02/The-Prompt-Ladder`](./AI-Fluency/week-02/The-Prompt-Ladder/) | **The Prompt Ladder**: Progressive prompt scaffolding for specifying complex backend API requirements and contract constraints. |
| **Week 3** | [`week-03/Consistency-Not-Talent-Frame-Not-Upstage`](./AI-Fluency/week-03/Consistency-Not-Talent-Frame-Not-Upstage/) | **Consistency & Framing**: Layout consistency, visual framing, and clean component hierarchy without distracting noise. |
| **Week 3** | [`week-03/Decide-Once-Build-Your-Identity-Kit`](./AI-Fluency/week-03/Decide-Once-Build-Your-Identity-Kit/) | **Developer Identity Kit**: Defining cohesive typography, design tokens, color systems, and personal branding standards. |
| **Week 3** | [`week-03/curate-your-images`](./AI-Fluency/week-03/curate-your-images/) | **Curate Your Images**: Asset selection, responsive image sizing, compression pipelines, and modern web format standards. |
| **Week 3** | [`week-03/through-line-assignment`](./AI-Fluency/week-03/through-line-assignment/) | **The Through-Line**: Content mapping, story progression, user journey, and conversion call-to-actions (CTAs). |
| **Week 4** | [`week-04/Choose-your-stack-with-AI`](./AI-Fluency/week-04/Choose-your-stack-with-AI/) | **Choose Your Stack with AI**: AI-assisted architectural decision frameworks, trade-off matrix, and technology benchmarking. |
| **Week 4** | [`week-04/FL-04-Automation-Workflow`](./AI-Fluency/week-04/FL-04-Automation-Workflow/) | **Automation Workflow**: Designing automated scripting pipelines to streamline repetitive engineering workflows. |
| **Week 4** | [`week-04/FL-05-Agent-Concepts-and-MCP-Basics`](./AI-Fluency/week-04/FL-05-Agent-Concepts-and-MCP-Basics/) | **Agent Concepts & MCP Basics**: Model Context Protocol (MCP) primitives, tool exposure, context windows, and autonomous loops. |
| **Week 4** | [`week-04/Ship-a-Blank-Page`](./AI-Fluency/week-04/Ship-a-Blank-Page/) | **Ship a Blank Page**: Overcoming shipping friction by establishing a live production deployment pipeline from zero. |
| **Week 5** | [`week-05/Explain-It-Like-You-Built-It`](./AI-Fluency/week-05/Explain-It-Like-You-Built-It/) | **Explain It Like You Built It**: Deep technical dissection and presentation of complex software system internals. |
| **Week 5** | [`week-05/FL-06-Design-Your-Personal-Agent`](./AI-Fluency/week-05/FL-06-Design-Your-Personal-Agent/) | **Design Your Personal Agent**: Specification, tool schemas, and rubric architecture for an automated homework evaluation agent. |
| **Week 5** | [`week-05/FL-07-Build-The-Agent`](./AI-Fluency/week-05/FL-07-Build-The-Agent/) | **Build the Agent**: Implementing the **FlyRank Evaluator & Tutor Agent** via Node.js stdio MCP tools and reflection optimizer loop. |
| **Week 5** | [`week-05/PF-04-Personal-Website-and-DNS-Walkthrough`](./AI-Fluency/week-05/PF-04-Personal-Website-and-DNS-Walkthrough/) | **DNS Walkthrough**: Custom domain DNS record propagation, CNAME/A routing, TLS handshakes, and sub-domain routing. |
| **Week 6** | [`week-06/Make-It-Do-Something`](./AI-Fluency/week-06/Make-It-Do-Something/) | **Make It Do Something**: Adding rich interactive state, reactive UI elements, and client-side functionality. |
| **Week 6** | [`week-06/Open-It-on-Your-Phone`](./AI-Fluency/week-06/Open-It-on-Your-Phone/) | **Mobile Responsiveness**: Mobile device audit, viewport optimization, touch target compliance, and CSS media query hardening. |
| **Week 6** | [`week-06/Survive-the-Crit`](./AI-Fluency/week-06/Survive-the-Crit/) | **Survive the Crit**: Defending architectural decisions under peer review, incorporating feedback, and logging remediations. |
| **Week 7** | [`week-07/Break-Your-Own-Site`](./AI-Fluency/week-07/Break-Your-Own-Site/) | **Break Your Own Site**: Adversarial stress-testing, boundary input probing, console error zeroing, and UX hardening. |
| **Week 7** | [`week-07/Plant-Your-Flag`](./AI-Fluency/week-07/Plant-Your-Flag/) | **Plant Your Flag**: Production deployment to live personal domain ([`https://3mr5aled.vercel.app`](https://3mr5aled.vercel.app)), Vercel Analytics integration, and graduate badge. |

---

## 🎓 Anthropic Academy Certifications

As part of the formal internship curriculum, 14 verified courses from Anthropic Academy (representing 28 estimated hours) were completed:

```text
├── AI Fluency: Framework & Foundations
├── Claude 101
├── Introduction to Claude Cowork
├── AI Capabilities and Limitations
├── Claude Code 101
├── Claude Code in Action
├── Claude Platform 101
├── Introduction to Model Context Protocol (MCP)
├── Model Context Protocol: Advanced Topics
├── Introduction to Agent Skills
├── Introduction to Subagents
├── AI Fluency for Students
├── AI Fluency for Educators
└── Teaching AI Fluency
```

---

## 💻 Tech Stack & Tooling

<div align="center">

| Area | Technologies |
|---|---|
| **Languages & Runtimes** | Node.js (v20+ / v26), TypeScript, JavaScript (ESM/CJS), Python |
| **Backend & Web Frameworks** | Express.js, Next.js (App Router), React |
| **Databases & ORMs** | PostgreSQL, SQLite (`node:sqlite`), Prisma ORM |
| **AI & LLM Integrations** | Google Gemini API (Flash 1.5), OpenAI SDK, Model Context Protocol (MCP) |
| **Queues & Orchestration** | Inngest (durable execution, cron, background steps), React Flow (`@xyflow/react`) |
| **Document & PDF Generation** | PDFKit, Playwright headless Chromium, Print CSS (A4 formatting) |
| **DevOps & Containers** | Docker, Docker Compose, Vercel Edge Network, Git / GitHub |
| **Validation & Security** | Zod Schema Boundaries, JWT (JSON Web Tokens), Bcrypt password hashing |

</div>

---

## 📜 Program Verification & Contact

- **Program**: FlyRank AI Internship — Backend AI Engineering (July–September 2026)
- **Intern**: Amr Khaled Morcy (`amr.khaled.morcy@gmail.com`)
- **Public Verification Portal**: [`https://internship.flyrank.ai/verify`](https://internship.flyrank.ai/verify)
- **Primary Certificate ID**: `FR-D11-0A358-5D8C2`
- **FlyRank Corp.**: 5830 E 2nd St, Ste 7000, Casper, WY 82609 | `verify@internship.flyrank.ai`

---

<div align="center">
  <sub>Built and documented with precision during the FlyRank AI Internship • 2026</sub>
</div>
