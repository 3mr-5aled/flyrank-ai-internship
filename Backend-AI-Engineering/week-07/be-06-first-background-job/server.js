process.env.INNGEST_DEV = process.env.INNGEST_DEV || "1";

const express = require("express");
const { Inngest } = require("inngest");
const { serve } = require("inngest/express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Inngest client
const inngest = new Inngest({ id: "report-api" });

// Stage 1: say-hello function
const sayHello = inngest.createFunction(
  { id: "say-hello", name: "say-hello", triggers: [{ event: "test/hello" }] },
  async ({ event, step }) => {
    await step.sleep("sleep-5s", "5s");
    return "Hello from the background!";
  }
);

// Serve Inngest handler
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions: [sayHello],
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Report API server listening on http://localhost:${PORT}`);
});
