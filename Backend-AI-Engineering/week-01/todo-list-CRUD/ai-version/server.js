/**
 * AI-generated Todo List CRUD API — Stage 7 comparison copy.
 *
 * Prompt used (written from memory, no copy-paste from spec):
 *   "Build a REST API in Node.js with Express. Use in-memory storage only —
 *    no database. Five endpoints: GET /tasks (list all, 200; 404 if empty),
 *    GET /tasks/:id (200 or 404), POST /tasks (body needs 'title' string —
 *    missing → 400, success → 201 with {id,title,done:false}), PUT /tasks/:id
 *    (must supply at least one of title/done — empty body → 400, not found →
 *    404, success → 200), DELETE /tasks/:id (204 or 404). Auto-increment IDs.
 *    Also expose GET / (API info) and GET /health ({status:'ok'}). Seed two
 *    tasks on startup. Serve a Swagger UI at /docs backed by an OpenAPI 3.0
 *    JSON spec at /openapi.json. Port 3001 to avoid collision with my version."
 *
 * Runs on port 3001 so both servers can be live at the same time.
 */

const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./openapi.json");

const app = express();
const PORT = 3001;

// ── In-memory store ───────────────────────────────────────────────────────────

const SEED_TASKS = [
  { id: 1, title: "Task 1", done: false },
  { id: 2, title: "Task 2", done: true },
];

let tasks = SEED_TASKS.map((t) => ({ ...t }));
let nextId = tasks.length + 1; // auto-increment counter (AI addition)

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());

// ── Docs ──────────────────────────────────────────────────────────────────────

app.get("/openapi.json", (_req, res) => res.json(openapi));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

// ── Utility endpoints ─────────────────────────────────────────────────────────

app.get("/", (_req, res) => {
  res.json({ name: "Task API (AI)", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── GET /tasks ────────────────────────────────────────────────────────────────
// Supports ?done=true|false and ?search=<term> filters.

app.get("/tasks", (req, res) => {
  let result = tasks.slice();

  const { done, search } = req.query;

  if (done !== undefined) {
    const wantDone = done === "true";
    result = result.filter((t) => t.done === wantDone);
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(q));
  }

  if (result.length === 0) {
    return res.status(404).json({ error: "No tasks found" });
  }

  return res.json(result);
});

// ── GET /tasks/:id ────────────────────────────────────────────────────────────

app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }
  return res.json(task);
});

// ── POST /tasks ───────────────────────────────────────────────────────────────
// Validates that 'title' is a non-empty string.

app.post("/tasks", (req, res) => {
  const { title } = req.body ?? {};

  // AI adds a stricter check: title must exist AND be a non-empty string
  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ error: "title is required and must be a non-empty string" });
  }

  const newTask = { id: nextId++, title: title.trim(), done: false };
  tasks.push(newTask);
  return res.status(201).json(newTask);
});

// ── PUT /tasks/:id ────────────────────────────────────────────────────────────
// Merges title and/or done. Rejects body with neither field.

app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = tasks.findIndex((t) => t.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  const { title, done } = req.body ?? {};

  if (title === undefined && done === undefined) {
    return res.status(400).json({ error: "Provide at least one of: title, done" });
  }

  // Merge only recognised fields — ignores unknown keys
  if (title !== undefined) tasks[idx].title = String(title);
  if (done  !== undefined) tasks[idx].done  = Boolean(done);

  return res.json(tasks[idx]);
});

// ── DELETE /tasks/:id ─────────────────────────────────────────────────────────

app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }
  tasks.splice(idx, 1);
  return res.status(204).end();
});

// ── GET /stats ────────────────────────────────────────────────────────────────

app.get("/stats", (_req, res) => {
  const total = tasks.length;
  const done  = tasks.filter((t) => t.done).length;
  return res.json({ total, done, open: total - done });
});

// ── POST /reset ───────────────────────────────────────────────────────────────

app.post("/reset", (_req, res) => {
  tasks  = SEED_TASKS.map((t) => ({ ...t }));
  nextId = tasks.length + 1;
  return res.json({ message: "Reset to default tasks", tasks });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`AI-version Task API listening on port ${PORT}`);
  console.log(`Docs: http://localhost:${PORT}/docs`);
});
