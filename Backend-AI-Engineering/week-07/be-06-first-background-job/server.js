process.env.INNGEST_DEV = process.env.INNGEST_DEV || "1";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const { Inngest } = require("inngest");
const { serve } = require("inngest/express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory dictionary/map for reports
const reports = new Map();

// Inngest client
const inngest = new Inngest({ id: "report-api", isDev: true });

// Stage 1: say-hello function
const sayHello = inngest.createFunction(
  { id: "say-hello", name: "say-hello", triggers: [{ event: "test/hello" }] },
  async ({ event, step }) => {
    await step.sleep("sleep-5s", "5s");
    return "Hello from the background!";
  }
);

// Stage 2 & 3 & Extras: make-report function with retries, failure simulation, idempotency, concurrency
const makeReport = inngest.createFunction(
  {
    id: "make-report",
    name: "make-report",
    retries: 2,
    concurrency: [{ limit: 2 }],
    triggers: [{ event: "report/requested" }],
  },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    // Stretch: Idempotency check - skip if already built
    const existing = reports.get(id);
    if (existing && existing.status === "done") {
      return { id, status: "done", result: existing.result, note: "Already processed (idempotent)" };
    }

    await step.sleep("do-the-slow-work", "8s");

    const result = await step.run("build-report", async () => {
      // Stage 3: Intentional failure for topic "fail"
      if (topic === "fail") {
        const report = reports.get(id);
        if (report) {
          report.status = "failed";
          report.error = "The report oven is broken!";
          report.failedAt = new Date().toISOString();
        }
        throw new Error("The report oven is broken!");
      }

      const generatedResult = `Comprehensive report for topic: ${topic}. Generated at ${new Date().toISOString()}`;
      const report = reports.get(id);
      if (report) {
        report.status = "done";
        report.result = generatedResult;
        report.completedAt = new Date().toISOString();
      }

      // Extras: write to outbox/<id>.txt (simulates email dispatch)
      try {
        const outboxDir = path.join(__dirname, "outbox");
        if (!fs.existsSync(outboxDir)) {
          fs.mkdirSync(outboxDir, { recursive: true });
        }
        fs.writeFileSync(path.join(outboxDir, `${id}.txt`), generatedResult, "utf8");
      } catch (err) {
        console.error("Failed writing to outbox:", err.message);
      }

      return { id, status: "done", result: generatedResult };
    });

    return result;
  }
);

// Stage 4: Heartbeat cron function (runs every minute)
const heartbeat = inngest.createFunction(
  { id: "heartbeat", name: "heartbeat", triggers: [{ cron: "* * * * *" }] },
  async ({ step }) => {
    return await step.run("summarize-reports", async () => {
      let pending = 0;
      let done = 0;
      let failed = 0;

      for (const report of reports.values()) {
        if (report.status === "pending") pending++;
        else if (report.status === "done") done++;
        else if (report.status === "failed") failed++;
      }

      const summary = `[Heartbeat] Report Summary: ${pending} pending, ${done} done, ${failed} failed (Total: ${reports.size})`;
      console.log(summary);
      return { pending, done, failed, total: reports.size, summary };
    });
  }
);

// Serve Inngest handler with all 3 functions
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [sayHello, makeReport, heartbeat],
  })
);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Extras: Control panel - GET /reports
app.get("/reports", (req, res) => {
  res.status(200).json(Array.from(reports.values()));
});

// Stage 2 & 3: POST /reports with input validation
app.post("/reports", async (req, res) => {
  const { topic } = req.body || {};

  // Reject bad input at the door
  if (!topic || typeof topic !== "string" || topic.trim() === "") {
    return res.status(400).json({ error: "Topic is required" });
  }

  const id = crypto.randomUUID();
  const report = {
    id,
    topic,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  reports.set(id, report);

  await inngest.send({
    name: "report/requested",
    data: { id, topic },
  });

  return res.status(202).json({ id, status: "pending" });
});

// Stage 2: Status endpoint - GET /reports/:id
app.get("/reports/:id", (req, res) => {
  const report = reports.get(req.params.id);
  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }
  return res.status(200).json(report);
});

app.listen(PORT, () => {
  console.log(`Report API server listening on http://localhost:${PORT}`);
});
