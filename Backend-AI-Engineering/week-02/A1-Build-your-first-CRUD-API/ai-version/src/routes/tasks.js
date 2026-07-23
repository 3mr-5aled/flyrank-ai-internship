const { Router } = require("express");
const store = require("../data/store");
const {
  validateTitle,
  validateDone,
  validatePositiveIntParam,
  validatePagination,
} = require("../middleware/validate");

const router = Router();

// ─── GET /tasks ───────────────────────────────────────────────────────────────

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     description: >
 *       Returns a paginated list of tasks. Supports substring search on `title`
 *       and filtering by `done` status. Results are sorted by ID ascending.
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Substring to search for in task titles (case-insensitive).
 *       - in: query
 *         name: done
 *         schema:
 *           type: boolean
 *         description: Filter by completion status (`true` or `false`).
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (1-indexed).
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of results per page (max 100).
 *     responses:
 *       200:
 *         description: Paginated list of tasks.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTasks'
 *       400:
 *         description: Invalid query parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", (req, res) => {
  const { search, done: doneRaw, page: pageRaw, limit: limitRaw } = req.query;

  // Validate pagination
  const pag = validatePagination(pageRaw, limitRaw);
  if (!pag.valid) {
    return res.status(400).json({ status: "error", errors: pag.errors });
  }

  // Validate done filter if provided
  let doneFilter = undefined;
  if (doneRaw !== undefined) {
    if (doneRaw !== "true" && doneRaw !== "false") {
      return res.status(400).json({
        status: "error",
        errors: ['"done" query param must be "true" or "false".'],
      });
    }
    doneFilter = doneRaw === "true";
  }

  let result = store.getAll();

  // Apply search filter
  if (search) {
    const term = search.toLowerCase();
    result = result.filter((t) => t.title.toLowerCase().includes(term));
  }

  // Apply done filter
  if (doneFilter !== undefined) {
    result = result.filter((t) => t.done === doneFilter);
  }

  // Paginate
  const total = result.length;
  const { page, limit } = pag;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  return res.status(200).json({
    status: "success",
    data: paginated,
    pagination: { total, page, limit, totalPages },
  });
});

// ─── POST /tasks ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     description: Creates a task with the given title. `done` is always initialised to `false`.
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", (req, res) => {
  const { title } = req.body;

  const titleVal = validateTitle(title);
  if (!titleVal.valid) {
    return res.status(400).json({ status: "error", errors: titleVal.errors });
  }

  const task = store.create(title.trim());
  return res.status(201).json({ status: "success", data: task });
});

// ─── GET /tasks/:id ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The task ID.
 *     responses:
 *       200:
 *         description: The requested task.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Task not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", (req, res) => {
  const idVal = validatePositiveIntParam(req.params.id);
  if (!idVal.valid) {
    return res.status(400).json({ status: "error", errors: idVal.errors });
  }

  const task = store.getById(idVal.value);
  if (!task) {
    return res
      .status(404)
      .json({ status: "error", message: `Task with id ${idVal.value} not found.` });
  }

  return res.status(200).json({ status: "success", data: task });
});

// ─── PUT /tasks/:id ───────────────────────────────────────────────────────────

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Fully update a task
 *     description: Replaces a task's `title` and `done` fields. Both fields are required.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The task ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdate'
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *       400:
 *         description: Validation error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Task not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", (req, res) => {
  const idVal = validatePositiveIntParam(req.params.id);
  if (!idVal.valid) {
    return res.status(400).json({ status: "error", errors: idVal.errors });
  }

  const { title, done } = req.body;
  const errors = [];

  const titleVal = validateTitle(title);
  if (!titleVal.valid) errors.push(...titleVal.errors);

  const doneVal = validateDone(done);
  if (!doneVal.valid) errors.push(...doneVal.errors);

  if (errors.length > 0) {
    return res.status(400).json({ status: "error", errors });
  }

  const updated = store.update(idVal.value, title.trim(), done);
  if (!updated) {
    return res
      .status(404)
      .json({ status: "error", message: `Task with id ${idVal.value} not found.` });
  }

  return res.status(200).json({ status: "success", data: updated });
});

// ─── DELETE /tasks/:id ────────────────────────────────────────────────────────

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: The task ID.
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Task deleted successfully.
 *       400:
 *         description: Invalid ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Task not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", (req, res) => {
  const idVal = validatePositiveIntParam(req.params.id);
  if (!idVal.valid) {
    return res.status(400).json({ status: "error", errors: idVal.errors });
  }

  const deleted = store.remove(idVal.value);
  if (!deleted) {
    return res
      .status(404)
      .json({ status: "error", message: `Task with id ${idVal.value} not found.` });
  }

  return res
    .status(200)
    .json({ status: "success", message: "Task deleted successfully." });
});

module.exports = router;
