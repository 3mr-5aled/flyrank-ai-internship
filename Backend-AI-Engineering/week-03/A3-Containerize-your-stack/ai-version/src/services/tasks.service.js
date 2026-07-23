// ===========================================================================
// SERVICE LAYER — the business rules. Storage-agnostic and HTTP-agnostic.
// ===========================================================================
// This is where the *decisions* live: what makes input valid, how a new id is
// chosen, what "not found" means. It never touches req/res (that's the route's
// job) and never touches the tasks array (that's the repository's job) — it
// just calls the repository and throws domain errors when a rule is broken.
const repo = require("../repositories/tasks.repository");
const { NotFoundError, ValidationError } = require("../error");

async function getAllTasks({ done, search } = {}) {
  let result = await repo.findAll();

  // Extra: filter by done=true / done=false
  if (done !== undefined) {
    if (done !== "true" && done !== "false") {
      throw new ValidationError(
        "Invalid 'done' query parameter. Must be 'true' or 'false'.",
      );
    }
    const doneBool = done === "true";
    result = result.filter((task) => task.done === doneBool);
  }

  // Extra: search titles
  if (search !== undefined) {
    const searchWord = String(search).trim();
    if (searchWord === "") {
      throw new ValidationError(
        "Invalid 'search' query parameter. Must not be empty.",
      );
    }
    const lowerSearchWord = searchWord.toLowerCase();
    result = result.filter((task) => task.title.toLowerCase().includes(lowerSearchWord));
  }

  return result;
}

async function getTask(id) {
  const task = await repo.findById(id);
  if (!task) {
    throw new NotFoundError(`Task ${id} not found`);
  }
  return task;
}

async function createTask(body = {}) {
  const { title } = body;
  if (title === undefined || title === null || String(title).trim() === "") {
    throw new ValidationError("title is required and cannot be empty");
  }
  return await repo.create({ title: String(title).trim(), done: false });
}

async function updateTask(id, body = {}) {
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

  const updated = await repo.update(id, changes);
  if (!updated) {
    throw new NotFoundError(`Task ${id} not found`);
  }
  return updated;
}

async function deleteTask(id) {
  const removed = await repo.remove(id);
  if (!removed) {
    throw new NotFoundError(`Task ${id} not found`);
  }
}

async function getStats() {
  const all = await repo.findAll();
  const done = all.filter((t) => t.done).length;
  return { total: all.length, done, open: all.length - done };
}

async function resetTasks() {
  return await repo.reset();
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
