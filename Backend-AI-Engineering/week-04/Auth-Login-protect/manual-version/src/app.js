const express = require("express");
const swaggerUi = require("swagger-ui-express");
const openapi = require("../openapi.json");
const { createClient } = require("@supabase/supabase-js");

const metaRoutes = require("./routes/meta.routes");
const tasksRoutes = require("./routes/tasks.routes");
const authRoutes = require("./routes/auth.routes");
const { errorHandler } = require("./middleware/error-handler");

function createApp() {
  const app = express();
  app.use(express.json());

  if (
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY)
  ) {
    app.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY,
    );
  }

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  app.use(metaRoutes);
  app.use(tasksRoutes);
  app.use(authRoutes);

  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
