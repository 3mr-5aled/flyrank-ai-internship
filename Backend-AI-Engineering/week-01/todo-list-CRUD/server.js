const express = require("express");
const app = express();
const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// 1. GET / endpoint
app.get("/", (req, res) => {
  res.send({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

// 2, GET /health endpoint
app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});
