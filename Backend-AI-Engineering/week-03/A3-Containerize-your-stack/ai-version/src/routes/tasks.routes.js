// ===========================================================================
// ROUTE (HTTP) LAYER — the thin translator between HTTP and the service.
// ===========================================================================
// Each handler does only three things: read what it needs from the request,
// call the service, and shape the HTTP response (status code + JSON). No
// business rules, no data access. If the service throws, we hand the error to
// Express with next(err) and the error-handler middleware sets the status code.

const express = require("express");
const service = require("../services/tasks.service");

const router = express.Router();

// Read: list (with optional ?done= and ?search= extras)
router.get("/tasks", async (req, res, next) => {
  try {
    const tasks = await service.getAllTasks({
      done: req.query.done,
      search: req.query.search,
    });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// Extra: stats
router.get("/stats", async (req, res, next) => {
  try {
    const stats = await service.getStats();
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

// Extra: reset to the seed tasks
router.post("/reset", async (req, res, next) => {
  try {
    const resetData = await service.resetTasks();
    res.json(resetData);
  } catch (err) {
    next(err);
  }
});

// Create
router.post("/tasks", async (req, res, next) => {
  try {
    const task = await service.createTask(req.body ?? {});
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

// Read: single task
router.get("/tasks/:id", async (req, res, next) => {
  try {
    const task = await service.getTask(Number(req.params.id));
    res.json(task);
  } catch (err) {
    next(err);
  }
});

// Update
router.put("/tasks/:id", async (req, res, next) => {
  try {
    const updatedTask = await service.updateTask(Number(req.params.id), req.body ?? {});
    res.json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// Delete
router.delete("/tasks/:id", async (req, res, next) => {
  try {
    await service.deleteTask(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
