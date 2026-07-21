const { Router } = require("express");
const store = require("../data/store");

const router = Router();

// ─── POST /reset ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /reset:
 *   post:
 *     summary: Reset tasks to default seed data
 *     description: >
 *       Clears all current tasks and repopulates the store with the default
 *       seed tasks. The ID counter also resets to 1.
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Store reset successfully.
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
 *                   example: Tasks have been reset to default seed data.
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
 */
router.post("/reset", (req, res) => {
  store.reset();
  return res.status(200).json({
    status: "success",
    message: "Tasks have been reset to default seed data.",
    data: store.getAll(),
  });
});

// ─── GET /status ──────────────────────────────────────────────────────────────

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Get task statistics
 *     description: Returns the total number of tasks, tasks marked as done, and tasks still undone.
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Task statistics.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Status'
 */
router.get("/status", (req, res) => {
  const all = store.getAll();
  const done = all.filter((t) => t.done).length;
  const undone = all.length - done;

  return res.status(200).json({
    status: "success",
    data: {
      total: all.length,
      done,
      undone,
    },
  });
});

module.exports = router;
