const prisma = require("../db");

const seedTasksData = [
  { title: "Learn SQL", done: false },
  { title: "Build a REST API", done: false },
  { title: "Deploy the application", done: false },
];

const seedTasks = async () => {
  await prisma.task.createMany({
    data: seedTasksData,
  });
};

const initializeDatabase = async () => {
  try {
    const count = await prisma.task.count();
    if (count === 0) {
      await seedTasks();
    }
  } catch (err) {
    console.error("Failed to initialize database:", err);
  }
};

initializeDatabase();

async function findAll(filters = {}) {
  const { done, search } = filters;
  const where = {};

  if (done !== undefined) {
    where.done = Boolean(done);
  }

  if (search !== undefined) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  return await prisma.task.findMany({
    where,
    orderBy: {
      title: "asc",
    },
  });
}

async function findById(id) {
  return await prisma.task.findUnique({
    where: { id: Number(id) },
  });
}

async function create({ title }) {
  return await prisma.task.create({
    data: {
      title,
      done: false,
    },
  });
}

async function update(id, changes) {
  try {
    const existing = await findById(id);
    if (!existing) return null;

    const data = {};
    if (changes.title !== undefined) data.title = changes.title;
    if (changes.done !== undefined) data.done = changes.done;

    return await prisma.task.update({
      where: { id: Number(id) },
      data,
    });
  } catch (err) {
    return null;
  }
}

async function remove(id) {
  try {
    const existing = await findById(id);
    if (!existing) return false;

    await prisma.task.delete({
      where: { id: Number(id) },
    });
    return true;
  } catch (err) {
    return false;
  }
}

async function getStats() {
  const total = await prisma.task.count();
  const done = await prisma.task.count({
    where: { done: true },
  });
  const open = total - done;

  return { total, done, open, pending: open };
}

async function reset() {
  await prisma.task.deleteMany({});
  await seedTasks();
  return await findAll();
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  getStats,
  reset,
};
