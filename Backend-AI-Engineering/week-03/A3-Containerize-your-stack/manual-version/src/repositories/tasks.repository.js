const db = require("../db");

// Seed data
const seedTasks = async () => {
  await db.query("INSERT INTO tasks (title, done) VALUES ('Learn SQL', false)");
  await db.query(
    "INSERT INTO tasks (title, done) VALUES ('Build a REST API', false)",
  );
  await db.query(
    "INSERT INTO tasks (title, done) VALUES ('Deploy the application', false)",
  );
};

// First-run Initialization: Create table if it doesn't exist & seed if empty
const initializeDatabase = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      done BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const res = await db.query("SELECT COUNT(*) FROM tasks");
  if (parseInt(res.rows[0].count, 10) === 0) {
    await seedTasks();
  }
};

initializeDatabase().catch((err) =>
  console.error("Failed to initialize database:", err),
);

async function findAll(filters = {}) {
  const { done, search } = filters;
  let query = "SELECT * FROM tasks";
  const params = [];
  const conditions = [];

  if (done !== undefined) {
    params.push(done);
    conditions.push(`done = $${params.length}`);
  }

  if (search !== undefined) {
    params.push(`%${search}%`);
    conditions.push(`title LIKE $${params.length}`);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY title ASC";

  const res = await db.query(query, params);
  return res.rows;
}

async function findById(id) {
  const res = await db.query("SELECT * FROM tasks WHERE id = $1", [id]);
  return res.rows[0] || null;
}

async function create({ title }) {
  const res = await db.query(
    "INSERT INTO tasks (title, done) VALUES ($1, false) RETURNING id",
    [title],
  );
  return await findById(res.rows[0].id);
}

async function update(id, changes) {
  const task = await findById(id);
  if (!task) {
    return null;
  }

  const title = changes.title !== undefined ? changes.title : task.title;
  const done = changes.done !== undefined ? changes.done : task.done;

  const res = await db.query(
    "UPDATE tasks SET title = $1, done = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
    [title, done, id],
  );
  return res.rows[0];
}

async function remove(id) {
  const res = await db.query("DELETE FROM tasks WHERE id = $1", [id]);
  return res.rowCount > 0;
}

async function getStats() {
  const totalRes = await db.query("SELECT COUNT(*) FROM tasks");
  const doneRes = await db.query(
    "SELECT COUNT(*) FROM tasks WHERE done = true",
  );

  const total = parseInt(totalRes.rows[0].count, 10);
  const done = parseInt(doneRes.rows[0].count, 10);
  const pending = total - done;

  return { total, done, open: pending, pending };
}

async function reset() {
  await db.query("TRUNCATE TABLE tasks RESTART IDENTITY");
  await seedTasks();
  return await findAll();
}

module.exports = { findAll, findById, create, update, remove, getStats, reset };
