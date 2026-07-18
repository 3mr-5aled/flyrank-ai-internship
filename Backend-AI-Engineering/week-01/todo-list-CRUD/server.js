const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openapi = require("./openapi.json");
const app = express();
const port = 3000;

const defaultTasks = [
  { id: 1, title: "Task 1", done: false },
  { id: 2, title: "Task 2", done: true },
];

const tasks = [
  {
    id: 1,
    title: "Task 1",
    done: false,
  },
  {
    id: 2,
    title: "Task 2",
    done: true,
  },
];

app.use(express.json());

// Serve OpenAPI spec and Swagger UI
app.get("/openapi.json", (req, res) => res.json(openapi));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

// Stage 1:  Your first real endpoint

// 1. GET / endpoint
app.get("/", (req, res) => {
  res.send({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

// 2, GET /health endpoint
app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});

// Stage 2 :  Read: list and single task

// 1. GET /tasks endpoint
app.get("/tasks", (req, res) => {
  if (tasks.length === 0) {
    res.status(404).send({ error: "No tasks found" });
  }
  res.send(tasks);
});

// 2. GET /tasks/:id endpoint
app.get("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    res.status(404).send({ error: `Task ${taskId} not found` });
  } else {
    res.send(task);
  }
});

// Stage 3: Create: POST a new task
// create task endpoint
app.post("/tasks", (req, res) => {
  // support filters: ?done=true|false, ?search=term
  let result = tasks.slice();
  const { done, search } = req.query;
  if (done !== undefined) {
    const wantDone = done === "true";
    result = result.filter((t) => Boolean(t.done) === wantDone);
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(q));
  }
  if (result.length === 0) {
    return res.status(404).send({ error: "No tasks found" });
  }
  return res.send(result);
});

// Stats endpoint
app.get("/stats", (req, res) => {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const open = total - done;
  return res.send({ total, done, open });

  newTask.id = tasks.length + 1;
  newTask.done = false;

  tasks.push(newTask);

  res.status(201).send(newTask);
});

// Stage 4: Update & Delete
// 1. PUT /tasks/:id endpoint
app.put("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  const updatedTask = req.body;

  // Reset endpoint — restore default seed tasks
  app.post("/reset", (req, res) => {
    tasks.length = 0;
    defaultTasks.forEach((t) => tasks.push({ ...t }));
    return res.status(200).send({ message: "Reset to default tasks", tasks });
  });

  if (taskIndex === -1) {
    return res.status(404).send({ error: `Task ${taskId} not found` });
  }

  if (!updatedTask) {
    return res.status(400).send({ error: "No data provided for update" });
  }

  if (updatedTask.title === undefined && updatedTask.done === undefined) {
    return res
      .status(400)
      .send({ error: "No valid fields provided for update" });
  }

  tasks[taskIndex] = { ...tasks[taskIndex], ...updatedTask };
  return res.status(200).send(tasks[taskIndex]);
});

// 2. DELETE /tasks/:id endpoint
app.delete("/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    return res.status(404).send({ error: `Task ${taskId} not found` });
  }
  tasks.splice(taskIndex, 1);
  return res.status(204).end();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
