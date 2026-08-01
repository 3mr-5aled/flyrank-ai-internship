const express = require("express");
const service = require("../services/tasks.services");

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
    res.json(await service.getStats());
  } catch (err) {
    next(err);
  }
});

// Extra: reset to the seed tasks
router.post("/reset", async (req, res, next) => {
  try {
    const tasks = await service.resetTasks();
    res.json({ message: "Tasks reset to default", tasks });
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
    res.json(await service.getTask(Number(req.params.id)));
  } catch (err) {
    next(err);
  }
});

// Update
router.put("/tasks/:id", async (req, res, next) => {
  try {
    res.json(await service.updateTask(Number(req.params.id), req.body ?? {}));
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
