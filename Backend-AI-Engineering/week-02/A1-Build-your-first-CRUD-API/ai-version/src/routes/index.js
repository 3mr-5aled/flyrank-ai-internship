const { Router } = require("express");

const router = Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: API info and available routes
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Returns API metadata and a list of all available routes.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Tasks CRUD API
 *                     version:
 *                       type: string
 *                       example: 1.0.0
 *                     docs:
 *                       type: string
 *                       example: http://localhost:3000/api-docs
 *                     routes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           method:
 *                             type: string
 *                           path:
 *                             type: string
 *                           description:
 *                             type: string
 */
router.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      name: "Tasks CRUD API",
      version: "1.0.0",
      docs: `${req.protocol}://${req.get("host")}/api-docs`,
      routes: [
        { method: "GET",    path: "/",          description: "API info and available routes" },
        { method: "GET",    path: "/health",     description: "Health check" },
        { method: "GET",    path: "/tasks",      description: "List all tasks (search, filter, pagination)" },
        { method: "POST",   path: "/tasks",      description: "Create a new task" },
        { method: "GET",    path: "/tasks/:id",  description: "Get a specific task by ID" },
        { method: "PUT",    path: "/tasks/:id",  description: "Fully update a task by ID" },
        { method: "DELETE", path: "/tasks/:id",  description: "Delete a task by ID" },
        { method: "POST",   path: "/reset",      description: "Reset tasks to default seed data" },
        { method: "GET",    path: "/status",     description: "Get task counts (total, done, undone)" },
      ],
    },
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API is healthy and running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     uptime:
 *                       type: number
 *                       example: 120.45
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     message:
 *                       type: string
 *                       example: API is up and running.
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      message: "API is up and running.",
    },
  });
});

module.exports = router;
