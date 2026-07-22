const repo = require("../repositories/tasks.repository");
const { NotFoundError, ValidationError } = require("../error");

function getAllTasks(query = {}) {
  const { done, search } = query;
  const filters = {};

  if (done !== undefined) {
    if (done !== "true" && done !== "false") {
      throw new ValidationError(
        "Invalid 'done' query parameter. Must be 'true' or 'false'.",
      );
    }
    filters.done = done === "true" ? 1 : 0;
  }

  if (search !== undefined) {
    const searchWord = String(search).trim();
    if (searchWord === "") {
      throw new ValidationError(
        "Invalid 'search' query parameter. Must not be empty.",
      );
    }
    filters.search = searchWord;
  }

  return repo.findAll(filters);
}

function getTask(id) {
  const task = repo.findById(id);
  if (!task) {
    throw new NotFoundError(`Task ${id} not found`);
  }
  return task;
}

function createTask(body = {}) {
  const { title } = body;
  if (title === undefined || title === null || String(title).trim() === "") {
    throw new ValidationError("title is required and cannot be empty");
  }
  return repo.create({ title: String(title).trim(), done: false });
}

function updateTask(id, body = {}) {
  const hasTitle = Object.prototype.hasOwnProperty.call(body, "title");
  const hasDone = Object.prototype.hasOwnProperty.call(body, "done");

  if (!hasTitle && !hasDone) {
    throw new ValidationError("request body must include title and/or done");
  }

  const changes = {};

  if (hasTitle) {
    if (body.title === null || String(body.title).trim() === "") {
      throw new ValidationError("title cannot be empty");
    }
    changes.title = String(body.title).trim();
  }

  if (hasDone) {
    if (typeof body.done !== "boolean") {
      throw new ValidationError("done must be a boolean");
    }
    changes.done = body.done;
  }

  const updated = repo.update(id, changes);
  if (!updated) {
    throw new NotFoundError(`Task ${id} not found`);
  }
  return updated;
}

function deleteTask(id) {
  const removed = repo.remove(id);
  if (!removed) {
    throw new NotFoundError(`Task ${id} not found`);
  }
}

function getStats() {
  return repo.getStats();
}

function resetTasks() {
  return repo.reset();
}

module.exports = {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getStats,
  resetTasks,
};
