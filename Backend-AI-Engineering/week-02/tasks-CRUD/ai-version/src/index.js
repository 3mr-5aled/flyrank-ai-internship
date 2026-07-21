const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger/swagger");

const indexRouter = require("./routes/index");
const tasksRouter = require("./routes/tasks");
const utilityRouter = require("./routes/utility");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ────────────────────────────────────────────────────────

/** Parse incoming JSON bodies */
app.use(express.json());

/** Attach request timestamp for potential logging use */
app.use((req, _res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ─── Swagger UI ───────────────────────────────────────────────────────────────

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Tasks API Docs",
    swaggerOptions: {
      docExpansion: "list",
      filter: true,
      showRequestDuration: true,
    },
  })
);

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use("/", indexRouter);
app.use("/tasks", tasksRouter);
app.use("/", utilityRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.method} ${req.path} not found.`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error(`[${req.requestTime}] Unhandled error:`, err);

  // Handle malformed JSON
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      status: "error",
      message: "Invalid JSON in request body.",
    });
  }

  res.status(500).json({
    status: "error",
    message: "An unexpected internal server error occurred.",
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Tasks CRUD API is running`);
  console.log(`   ➜  Local:   http://localhost:${PORT}`);
  console.log(`   ➜  Docs:    http://localhost:${PORT}/api-docs`);
  console.log(`   ➜  Health:  http://localhost:${PORT}/health\n`);
});

module.exports = app; // export for testing purposes
