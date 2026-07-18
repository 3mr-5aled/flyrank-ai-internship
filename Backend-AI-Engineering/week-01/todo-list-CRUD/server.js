const express = require("express");
const app = express();
const port = 3000;

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use(express.json());

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
  const newTask = req.body;

  if (!newTask || !newTask.title) {
    return res.status(400).send({
      error: "Title is required",
    });
  }

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
