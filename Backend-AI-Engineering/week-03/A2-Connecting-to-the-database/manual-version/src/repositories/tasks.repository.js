const path = require("path");
const db = require("better-sqlite3")(path.join(__dirname, "../tasks.db"));

const SEED_TASKS = [
  { id: 1, title: "Buy groceries", done: false },
  { id: 2, title: "Walk the dog", done: true },
  { id: 3, title: "Read a book", done: false },
];

const insertSeedTask = db.prepare(
  "INSERT INTO tasks (id, title, done) VALUES (?, ?, ?)"
);

function seedTasks(tasks = SEED_TASKS) {
  for (const task of tasks) {
    insertSeedTask.run(task.id, task.title, task.done ? 1 : 0);
  }
}

// Helper to convert SQLite 0/1 to boolean
const mapTask = (task) => (task ? { ...task, done: !!task.done } : null);

// Initialize the database and seed tasks if the table is empty
const initDb = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const count = db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count;
  if (count === 0) {
    db.transaction(seedTasks)(SEED_TASKS);
  }
};

initDb();

function findAll(filters = {}) {
  const { done, search } = filters;
  let query = "SELECT * FROM tasks";
  const params = [];
  const conditions = [];

  if (done !== undefined) {
    conditions.push("done = ?");
    params.push(done === true || done === 1 || done === "true" ? 1 : 0);
  }

  if (search !== undefined && String(search).trim() !== "") {
    conditions.push("LOWER(title) LIKE ?");
    params.push(`%${String(search).trim().toLowerCase()}%`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY id ASC";

  return db
    .prepare(query)
    .all(...params)
    .map(mapTask);
}

function findById(id) {
  return mapTask(db.prepare("SELECT * FROM tasks WHERE id = ?").get(id));
}

function create({ title }) {
  const info = db
    .prepare("INSERT INTO tasks (title, done) VALUES (?, 0)")
    .run(title);
  return findById(info.lastInsertRowid);
}

function update(id, changes) {
  const task = findById(id);
  if (!task) return null;

  const title =
    changes.title !== undefined ? String(changes.title).trim() : task.title;
  const done =
    changes.done !== undefined
      ? changes.done === true || changes.done === 1
        ? 1
        : 0
      : task.done
      ? 1
      : 0;

  db.prepare(
    `
    UPDATE tasks 
    SET title = ?, done = ?, updated_at = datetime('now') 
    WHERE id = ?
  `
  ).run(title, done, id);

  return findById(id);
}

function remove(id) {
  return db.prepare("DELETE FROM tasks WHERE id = ?").run(id).changes > 0;
}

function getStats() {
  const stats = db
    .prepare(
      `
      SELECT
        COUNT(*) AS total,
        COUNT(CASE WHEN done = 1 THEN 1 END) AS done,
        COUNT(CASE WHEN done = 0 THEN 1 END) AS open
      FROM tasks
    `
    )
    .get();

  return stats;
}

function reset() {
  const clear = db.prepare("DELETE FROM tasks");
  const resetTransaction = db.transaction((tasks) => {
    clear.run();
    seedTasks(tasks);
  });
  resetTransaction(SEED_TASKS);
  return findAll();
}

module.exports = {
  initDb,
  findAll,
  findById,
  create,
  update,
  remove,
  getStats,
  reset,
};

