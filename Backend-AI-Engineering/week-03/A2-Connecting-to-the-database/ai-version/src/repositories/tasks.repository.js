// ===========================================================================
// REPOSITORY LAYER — the ONLY file that knows *where* tasks are stored.
// ===========================================================================
// SQLite implementation: these functions run SELECT / INSERT / UPDATE / DELETE
// on a local SQLite database file called task.db.
// The functions return COPIES, the way a database hands you fresh rows.

const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "../../task.db");
const db = new Database(dbPath);

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  );
`);

const SEED_TASKS = [
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
  {
    id: 3,
    title: "Task 3",
    done: false,
  },
];

// Helper to map database rows back to JavaScript objects with boolean 'done'
function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    done: !!row.done,
  };
}

// Seed the database if it is currently empty
const count = db.prepare("SELECT COUNT(*) as count FROM tasks").get().count;
if (count === 0) {
  const insert = db.prepare("INSERT INTO tasks (id, title, done) VALUES (?, ?, ?)");
  const insertTransaction = db.transaction((tasks) => {
    for (const t of tasks) {
      insert.run(t.id, t.title, t.done ? 1 : 0);
    }
  });
  insertTransaction(SEED_TASKS);
}

function findAll() {
  const rows = db.prepare("SELECT * FROM tasks").all();
  return rows.map(mapRow);
}

function findById(id) {
  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  return mapRow(row);
}

function create(task) {
  const info = db
    .prepare("INSERT INTO tasks (title, done) VALUES (?, ?)")
    .run(task.title, task.done ? 1 : 0);
  return findById(info.lastInsertRowid);
}

function update(id, changes) {
  const keys = Object.keys(changes);
  if (keys.length === 0) {
    return findById(id);
  }

  const sets = [];
  const values = [];

  for (const key of keys) {
    if (key === "title") {
      sets.push("title = ?");
      values.push(changes.title);
    } else if (key === "done") {
      sets.push("done = ?");
      values.push(changes.done ? 1 : 0);
    }
  }

  values.push(id);
  const info = db
    .prepare(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`)
    .run(...values);

  if (info.changes === 0) {
    return null;
  }
  return findById(id);
}

function remove(id) {
  const info = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return info.changes > 0;
}

function reset() {
  // Clear the table
  db.prepare("DELETE FROM tasks").run();

  // Reset the AUTOINCREMENT sequence for sqlite
  try {
    db.prepare("DELETE FROM sqlite_sequence WHERE name = 'tasks'").run();
  } catch (err) {
    // If table sequence row doesn't exist, ignore
  }

  // Seed tasks back with explicit IDs
  const insert = db.prepare("INSERT INTO tasks (id, title, done) VALUES (?, ?, ?)");
  const insertTransaction = db.transaction((tasks) => {
    for (const t of tasks) {
      insert.run(t.id, t.title, t.done ? 1 : 0);
    }
  });
  insertTransaction(SEED_TASKS);

  return findAll();
}

module.exports = { findAll, findById, create, update, remove, reset };
