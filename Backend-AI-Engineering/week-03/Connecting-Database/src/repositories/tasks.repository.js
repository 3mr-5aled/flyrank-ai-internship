// ===========================================================================
// REPOSITORY LAYER — the ONLY file that knows *where* tasks are stored.
// ===========================================================================
// Right now that's a list in memory (exactly like Assignment 1). But this is
// the single file you rewrite to move to a real database:
//   - Assignment 2 (SQLite):   these functions run SELECT / INSERT / UPDATE / DELETE
//   - Assignment 3 (Postgres): same functions, a different driver
// The routes and the service NEVER change, because they only ever call
// findAll / findById / create / update / remove — they don't care what's behind them.
// The functions return COPIES, the way a database hands you fresh rows.

const db = require("../tasks.db");

function findAll() {
  return db.all("SELECT * FROM tasks", (err, rows) => {
    if (err) {
      console.error(err.message);
      return [];
    }
    return rows.map((row) => ({ ...row }));
  });
}

function findById(id) {
  return db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return null;
    }
    return row ? { ...row } : null;
  });
}

function create(task) {
  const { title, done } = task;
  return db.run(
    "INSERT INTO tasks (title, done) VALUES (?, ?)",
    [title, done],
    (err) => {
      if (err) {
        console.error(err.message);
      }
    },
  );
}

function update(id, changes) {
  const { title, done } = changes;
  return db.run(
    "UPDATE tasks SET title = ?, done = ? WHERE id = ?",
    [title, done, id],
    (err) => {
      if (err) {
        console.error(err.message);
      }
    },
  );
}

function remove(id) {
  return db.run("DELETE FROM tasks WHERE id = ?", [id], (err) => {
    if (err) {
      console.error(err.message);
      return false;
    }
    return true;
  });
}

function reset() {
  tasks = SEED_TASKS.map((task) => ({ ...task }));
  return findAll();
}

module.exports = { findAll, findById, create, update, remove, reset };
