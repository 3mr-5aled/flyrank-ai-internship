// The API's "front door" routes: what this API is, and whether it's alive.
// These are simple enough to answer directly — no service needed.
const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks", "/stats", "/reset"],
  });
});

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

router.get("/public/info", (req, res) => {
  res.status(200).json({ message: "Welcome stranger! This info is public." });
});

router.get("/protected/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access token required" });
  }

  const token = authHeader.split(" ")[1]?.trim();
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  return res.status(200).json({
    message: "Welcome to your protected profile!",
    token,
  });
});

module.exports = router;
