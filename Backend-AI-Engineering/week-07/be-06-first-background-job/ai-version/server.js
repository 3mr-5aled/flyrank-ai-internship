const express = require("express");
const { Inngest } = require("inngest");
const { serve } = require("inngest/express");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(express.json());

const inngest = new Inngest({ id: "report-api" });
const reports = {};

// Background job: make-report
const makeReport = inngest.createFunction(
  { id: "make-report", retries: 2, triggers: [{ event: "report/requested" }] },
  async ({ event, step }) => {
    const { id, topic } = event.data;

    await step.sleep("wait-8s", "8s");

    await step.run("build-report", () => {
      if (topic === "fail") {
        throw new Error("The report oven is broken!");
      }
      reports[id] = {
        ...reports[id],
        status: "done",
        result: `Report about ${topic}`,
      };
      return reports[id];
    });
  }
);

// Cron job: heartbeat
const heartbeat = inngest.createFunction(
  { id: "heartbeat", triggers: [{ cron: "* * * * *" }] },
  async ({ step }) => {
    await step.run("log-summary", () => {
      const all = Object.values(reports);
      const pending = all.filter((r) => r.status === "pending").length;
      const done = all.filter((r) => r.status === "done").length;
      const failed = all.filter((r) => r.status === "failed").length;
      console.log(`Cron: pending=${pending}, done=${done}, failed=${failed}`);
    });
  }
);

// Serve inngest
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [makeReport, heartbeat],
  })
);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/reports", async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: "topic required" });
  }

  const id = crypto.randomUUID();
  reports[id] = { id, topic, status: "pending" };

  await inngest.send({
    name: "report/requested",
    data: { id, topic },
  });

  res.status(202).json({ id, status: "pending" });
});

app.get("/reports/:id", (req, res) => {
  const report = reports[req.params.id];
  if (!report) {
    return res.status(404).json({ error: "not found" });
  }
  res.json(report);
});

app.listen(PORT, () => {
  console.log(`AI version running on http://localhost:${PORT}`);
});
