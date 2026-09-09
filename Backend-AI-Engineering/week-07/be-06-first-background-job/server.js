process.env.INNGEST_DEV = process.env.INNGEST_DEV || "1";

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

// Stage 2 & 3: make-report function with retries and failure simulation
const makeReport = inngest.createFunction(
  {
    id: "make-report",
    name: "make-report",
    retries: 2,
    triggers: [{ event: "report/requested" }],
  },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    await step.sleep("do-the-slow-work", "8s");

    const result = await step.run("build-report", async () => {
      // Stage 3: intentional failure for topic "fail"
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
      return { id, status: "done", result: generatedResult };
    });

    return result;
  }
);

// Serve Inngest handler
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [sayHello, makeReport],
  })
);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Stage 2 & 3: POST /reports with input validation
app.post("/reports", async (req, res) => {
  const { topic } = req.body || {};

  // Stage 3: Reject bad input at the door
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
