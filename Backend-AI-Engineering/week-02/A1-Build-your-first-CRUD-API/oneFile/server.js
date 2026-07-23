const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./openapi.json");
const app = express();
const port = 3000;

const defaultTasks = [
  { id: 1, title: "Task 1", done: false },
  { id: 2, title: "Task 2", done: true },
];

const tasks = defaultTasks.map((t) => ({ ...t })); // Create a copy of default tasks

app.use(express.json());

function resetTasks() {
  tasks.length = 0;
  defaultTasks.forEach((t) => tasks.push({ ...t }));
}
// -----------------------------------
// Stage 5 — Swagger UI at /docs
// -----------------------------------

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

// ---------------------------------------------------------------------------
// Stage 1 — the front door
// ---------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks", "/health", "/stats", "/reset"],
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ---------------------------------------------------------------------------
// Stage 2 — Read: list + single task (with optional filtering/search extras)
// ---------------------------------------------------------------------------
app.get("/tasks", (req, res) => {
  let result = tasks;

  if (req.query.done !== undefined) {
    if (req.query.done !== "true" && req.query.done !== "false") {
      return res.status(400).json({
        error:
          "Invalid value for 'done' query parameter. Use 'true' or 'false'.",
      });
    }
    const filteredDone = req.query.done === "true";
    result = result.filter((t) => Boolean(t.done) === filteredDone);
  }

  if (req.query.search) {
    const searchTitle = String(req.query.search).toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(searchTitle));
  }

  if (result.length === 0) {
    return res.status(404).json({ error: "No tasks found" });
  }
  res.json(result);
});

app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    res.status(404).json({ error: `Task ${taskId} not found` });
  }
  res.json(task);
});

// ---------------------------------------------------------------------------
// Extras — stats. Declared before "/tasks/:id" so "stats" isn't read as an id.
// ---------------------------------------------------------------------------

app.get("/stats", (req, res) => {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const open = total - done;
  return res.json({ total, done, open });
});

// ---------------------------------------------------------------------------
// Extras — reset back to the 3 example tasks
// ---------------------------------------------------------------------------
app.post("/reset", (req, res) => {
  resetTasks();
  return res.json({ message: "Tasks reset to default", tasks });
});

// ---------------------------------------------------------------------------
// Stage 3 — Create
// ---------------------------------------------------------------------------
app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (title === undefined || title === null || title.trim() === "") {
    return res.status(400).json({ error: "Title is required" });
  }

  const id = tasks.length === 0 ? 1 : Math.max(...tasks.map((t) => t.id)) + 1;
  const newTask = { id, title: String(title).trim(), done: false };
  tasks.push(newTask);
  return res.status(201).json(newTask);
});

// ---------------------------------------------------------------------------
// Stage 4 — Update + Delete
// ---------------------------------------------------------------------------

app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task ${id} not found` });
  }

  const { title, done } = req.body ?? {};
  const hasTitle = Object.prototype.hasOwnProperty.call(
    req.body ?? {},
    "title",
  );
  const hasDone = Object.prototype.hasOwnProperty.call(req.body ?? {}, "done");

  if (!hasTitle && !hasDone) {
    return res
      .status(400)
      .json({ error: "request body must include title and/or done" });
  }

  if (hasTitle) {
    if (title === null || String(title).trim() === "") {
      return res.status(400).json({ error: "title cannot be empty" });
    }
    task.title = String(title).trim();
  }

  if (hasDone) {
    if (typeof done !== "boolean") {
      return res.status(400).json({ error: "done must be a boolean" });
    }
    task.done = done;
  }

  res.json(task);
});

// 2. DELETE /tasks/:id endpoint
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task ${taskId} not found` });
  }
  tasks.splice(taskIndex, 1);
  return res.status(204).end();
});

app.listen(port, () => {
  console.log(`Example app listening on: http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/docs`);
});
