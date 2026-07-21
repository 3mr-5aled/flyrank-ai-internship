const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tasks CRUD API",
      version: "1.0.0",
      description:
        "A simple in-memory Tasks CRUD API built with Express.js. " +
        "Supports creating, reading, updating, and deleting tasks, " +
        "with search, filter, and pagination on the list endpoint.",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    tags: [
      { name: "General", description: "API info and health" },
      { name: "Tasks", description: "Task CRUD operations" },
    ],
    components: {
      schemas: {
        Task: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              example: 1,
              description: "Auto-incremented task identifier",
            },
            title: {
              type: "string",
              example: "Buy groceries",
              description: "Task description (1–200 characters)",
            },
            done: {
              type: "boolean",
              example: false,
              description: "Completion status of the task",
            },
          },
          required: ["id", "title", "done"],
        },
        TaskInput: {
          type: "object",
          required: ["title"],
          properties: {
            title: {
              type: "string",
              example: "Buy groceries",
              description: "Task description (1–200 characters)",
            },
          },
        },
        TaskUpdate: {
          type: "object",
          required: ["title", "done"],
          properties: {
            title: {
              type: "string",
              example: "Buy groceries",
              description: "Task description (1–200 characters)",
            },
            done: {
              type: "boolean",
              example: true,
              description: "Completion status of the task",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string", example: "Task not found." },
            errors: {
              type: "array",
              items: { type: "string" },
              example: ['"title" is required.'],
            },
          },
        },
        PaginatedTasks: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Task" },
            },
            pagination: {
              type: "object",
              properties: {
                total: { type: "integer", example: 5 },
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                totalPages: { type: "integer", example: 1 },
              },
            },
          },
        },
        Status: {
          type: "object",
          properties: {
            status: { type: "string", example: "success" },
            data: {
              type: "object",
              properties: {
                total: { type: "integer", example: 5 },
                done: { type: "integer", example: 2 },
                undone: { type: "integer", example: 3 },
              },
            },
          },
        },
      },
    },
  },
  // Paths to files with JSDoc Swagger annotations
  apis: ["./src/routes/*.js"],
};

module.exports = swaggerJsdoc(options);
