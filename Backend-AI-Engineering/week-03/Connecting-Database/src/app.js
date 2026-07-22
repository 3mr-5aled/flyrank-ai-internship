const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openapi = require("../openapi.json");

const metaRoutes = require("./routes/meta.routes");
const tasksRoutes = require("./routes/tasks.routes");
const { errorHandler } = require("./middlewares/error-handler");

function createApp() {
  const app = express();
  app.use(express.json());

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  app.use(metaRoutes);
  app.use(tasksRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
