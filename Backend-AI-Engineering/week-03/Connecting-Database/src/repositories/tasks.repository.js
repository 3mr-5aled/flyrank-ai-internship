const path = require("path");
const db = require("better-sqlite3")(path.join(__dirname, "../tasks.db"));

// 1. Setup table with timestamps
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Helper to seed tasks
const seedTasks = () => {
  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?, 0)");
  insert.run("Learn SQL");
  insert.run("Build a REST API");
  insert.run("Deploy the application");
};

// 2. Seed if empty
if (db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count === 0) {
  seedTasks();
}

// Helper to convert SQLite 0/1 to boolean
const mapTask = (task) => task ? { ...task, done: !!task.done } : null;

function findAll(filters = {}) {
  const { done, search } = filters;
  let query = "SELECT * FROM tasks";
  const params = [];
  const conditions = [];

  if (done !== undefined) {
    conditions.push("done = ?");
    params.push(done);
  }

  if (search !== undefined) {
    conditions.push("title LIKE ?");
    params.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY title ASC";

  return db.prepare(query).all(...params).map(mapTask);
}

function findById(id) {
  return mapTask(db.prepare("SELECT * FROM tasks WHERE id = ?").get(id));
}

function create({ title }) {
  const info = db.prepare("INSERT INTO tasks (title, done) VALUES (?, 0)").run(title);
  return findById(info.lastInsertRowid);
}

function update(id, changes) {
  const task = findById(id);
  if (!task) return null;

  const title = changes.title !== undefined ? changes.title : task.title;
  const done = changes.done !== undefined ? changes.done : task.done;

  db.prepare(`
    UPDATE tasks 
    SET title = ?, done = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(title, done ? 1 : 0, id);

  return findById(id);
}

function remove(id) {
  return db.prepare("DELETE FROM tasks WHERE id = ?").run(id).changes > 0;
}

function getStats() {
  const total = db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count;
  const done = db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE done = 1").get().count;
  return { total, done, open: total - done };
}

function reset() {
  db.exec("DELETE FROM tasks;");
  seedTasks();
  return findAll();
}

module.exports = { findAll, findById, create, update, remove, getStats, reset };
