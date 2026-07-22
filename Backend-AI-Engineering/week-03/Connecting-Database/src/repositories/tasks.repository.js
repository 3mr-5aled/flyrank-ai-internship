const path = require("path");
const db = require("better-sqlite3")(path.join(__dirname, "../tasks.db"));

// 1. Setup table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
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

function findAll() {
  return db.prepare("SELECT * FROM tasks").all().map(mapTask);
}

function findById(id) {
  return mapTask(db.prepare("SELECT * FROM tasks WHERE id = ?").get(id));
}

function create({ title }) {
  const info = db.prepare("INSERT INTO tasks (title, done) VALUES (?, 0)").run(title);
  return { id: info.lastInsertRowid, title, done: false };
}

function update(id, changes) {
  const task = findById(id);
  if (!task) return null;

  Object.assign(task, changes);
  db.prepare("UPDATE tasks SET title = ?, done = ? WHERE id = ?")
    .run(task.title, task.done ? 1 : 0, id);

  return task;
}

function remove(id) {
  return db.prepare("DELETE FROM tasks WHERE id = ?").run(id).changes > 0;
}

function reset() {
  db.exec("DELETE FROM tasks;");
  seedTasks();
  return findAll();
}

module.exports = { findAll, findById, create, update, remove, reset };
