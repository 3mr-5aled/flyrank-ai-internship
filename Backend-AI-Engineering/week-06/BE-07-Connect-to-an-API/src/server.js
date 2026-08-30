import express from "express";
import router from "./route.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/", router);

// Listen only if file is run directly (not imported during tests)
if (process.argv[1] && process.argv[1].endsWith("server.js")) {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
