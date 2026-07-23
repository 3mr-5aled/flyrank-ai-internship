// ===========================================================================
// REPOSITORY LAYER — the ONLY file that knows *where* tasks are stored.
// ===========================================================================
// PostgreSQL implementation: these functions run SELECT / INSERT / UPDATE / DELETE
// on a PostgreSQL database using the 'pg' library.
// The functions return COPIES, the way a database hands you fresh rows.

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// A promise representing DB initialization to guarantee it is done before any operations
let initPromise = null;

async function initDb(retries = 5, delay = 2000) {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    let client;
    for (let i = 0; i < retries; i++) {
      try {
        client = await pool.connect();
        console.log("Database connection checked successfully!");
        break;
      } catch (err) {
        console.error(`Database connection check failed (attempt ${i + 1}/${retries}): ${err.message}`);
        if (i === retries - 1) {
          initPromise = null; // reset so next call retries if it failed permanently
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    try {
      // Create the tasks table if it does not exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS tasks (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          done BOOLEAN NOT NULL DEFAULT FALSE
        );
      `);

      // Seed the database if it is currently empty
      const res = await client.query("SELECT COUNT(*) as count FROM tasks");
      const count = parseInt(res.rows[0].count, 10);
      if (count === 0) {
        console.log("Seeding initial tasks database...");
        const SEED_TASKS = [
          { id: 1, title: "Task 1", done: false },
          { id: 2, title: "Task 2", done: true },
          { id: 3, title: "Task 3", done: false },
        ];
        for (const t of SEED_TASKS) {
          await client.query(
            "INSERT INTO tasks (id, title, done) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING",
            [t.id, t.title, t.done]
          );
        }
        // Sync the sequence val
        await client.query("SELECT setval(pg_get_serial_sequence('tasks', 'id'), COALESCE(MAX(id), 1)) FROM tasks");
      }
    } finally {
      if (client) client.release();
    }
  })();

  return initPromise;
}

// Helper to map database rows back to JavaScript objects with boolean 'done'
function mapRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    done: !!row.done,
  };
}

async function findAll() {
  await initDb();
  const res = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
  return res.rows.map(mapRow);
}

async function findById(id) {
  await initDb();
  const res = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
  return mapRow(res.rows[0]);
}

async function create(task) {
  await initDb();
  const res = await pool.query(
    "INSERT INTO tasks (title, done) VALUES ($1, $2) RETURNING *",
    [task.title, !!task.done]
  );
  return mapRow(res.rows[0]);
}

async function update(id, changes) {
  await initDb();
  const keys = Object.keys(changes);
  if (keys.length === 0) {
    return findById(id);
  }

  const sets = [];
  const values = [];
  let paramIndex = 1;

  for (const key of keys) {
    if (key === "title") {
      sets.push(`title = $${paramIndex}`);
      values.push(changes.title);
      paramIndex++;
    } else if (key === "done") {
      sets.push(`done = $${paramIndex}`);
      values.push(!!changes.done);
      paramIndex++;
    }
  }

  values.push(id);
  const res = await pool.query(
    `UPDATE tasks SET ${sets.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (res.rowCount === 0) {
    return null;
  }
  return mapRow(res.rows[0]);
}

async function remove(id) {
  await initDb();
  const res = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
  return res.rowCount > 0;
}

async function reset() {
  await initDb();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE tasks RESTART IDENTITY CASCADE");

    const SEED_TASKS = [
      { id: 1, title: "Task 1", done: false },
      { id: 2, title: "Task 2", done: true },
      { id: 3, title: "Task 3", done: false },
    ];
    for (const t of SEED_TASKS) {
      await client.query(
        "INSERT INTO tasks (id, title, done) VALUES ($1, $2, $3)",
        [t.id, t.title, t.done]
      );
    }
    // Set sequence val
    await client.query("SELECT setval(pg_get_serial_sequence('tasks', 'id'), COALESCE(MAX(id), 1)) FROM tasks");
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
  return findAll();
}

module.exports = { findAll, findById, create, update, remove, reset };
