/**
 * In-memory task store with seed data.
 * Acts as the single source of truth for all task data.
 */

/** @type {{ id: number, title: string, done: boolean }[]} */
let tasks = [];

/** Tracks the next auto-increment ID */
let nextId = 1;

/** Default seed data used on initialisation and /reset */
const SEED_TASKS = [
  { title: "Buy groceries" },
  { title: "Write weekly report" },
  { title: "Call dentist for appointment" },
  { title: "Review pull requests" },
  { title: "Plan team meeting agenda" },
];

/**
 * Seeds the store with the default tasks.
 * Resets the ID counter as well.
 */
function seedTasks() {
  nextId = 1;
  tasks = SEED_TASKS.map((t) => ({
    id: nextId++,
    title: t.title,
    done: false,
  }));
}

// Initialise on first load
seedTasks();

// ─── CRUD helpers ────────────────────────────────────────────────────────────

/** Returns a shallow copy of all tasks */
function getAll() {
  return [...tasks];
}

/** Finds a task by numeric ID, returns undefined if not found */
function getById(id) {
  return tasks.find((t) => t.id === id);
}

/**
 * Creates and appends a new task.
 * @param {string} title
 * @returns {{ id: number, title: string, done: boolean }}
 */
function create(title) {
  const task = { id: nextId++, title, done: false };
  tasks.push(task);
  return { ...task };
}

/**
 * Fully replaces a task's mutable fields.
 * @param {number} id
 * @param {string} title
 * @param {boolean} done
 * @returns {{ id: number, title: string, done: boolean } | null}
 */
function update(id, title, done) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tasks[idx] = { id, title, done };
  return { ...tasks[idx] };
}

/**
 * Removes a task by ID.
 * @param {number} id
 * @returns {boolean} true if deleted, false if not found
 */
function remove(id) {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
}

/** Resets store to default seed data */
function reset() {
  seedTasks();
}

module.exports = { getAll, getById, create, update, remove, reset };
