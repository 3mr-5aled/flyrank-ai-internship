const path = require("path");
const db = require("better-sqlite3")(path.join(__dirname, "../tasks.db"), { verbose: console.log });

// Create table named tasks if it does not already exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`).run();

// Seed three example tasks only if the table is empty
const rowCount = db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count;
if (rowCount === 0) {
  const insertStmt = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  insertStmt.run("Learn SQL", 0);
  insertStmt.run("Build a REST API", 0);
  insertStmt.run("Deploy the application", 0);
}

function mapTask(row) {
  if (!row) return row;
  return {
    ...row,
    done: !!row.done,
  };
}

function findAll() {
  return db.prepare("SELECT * FROM tasks").all().map(mapTask);
}

function findById(id) {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  return mapTask(row);
}

function create(task) {
  const { title, done } = task;
  const info = db
    .prepare("INSERT INTO tasks (title, done) VALUES (?, ?)")
    .run(title, done ? 1 : 0);
  return findById(info.lastInsertRowid);
}

function update(id, changes) {

}

function remove(id) {

}

function reset() {

}

module.exports = { findAll, findById, create, update, remove, reset };
