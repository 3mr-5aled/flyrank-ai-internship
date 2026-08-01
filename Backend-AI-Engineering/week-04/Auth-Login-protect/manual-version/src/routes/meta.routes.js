// The API's "front door" routes: what this API is, and whether it's alive.
// These are simple enough to answer directly — no service needed.
const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");

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

router.get("/protected/profile", requireAuth, (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user.id,
      email: req.user.email,
      created_at: req.user.created_at,
    },
  });
});

router.get("/protected/dashboard", requireAuth, (req, res) => {
  return res.status(200).json({
    message: `Welcome to your dashboard, ${req.user.email}!`,
    user_id: req.user.id,
  });
});

router.get("/protected/admin", requireAuth, (req, res) => {
  const isAdmin =
    req.user.app_metadata?.role === "admin" ||
    req.user.user_metadata?.role === "admin" ||
    req.user.email === "admin@example.com";

  if (!isAdmin) {
    return res.status(403).json({
      error: "Forbidden: Admin privileges required",
    });
  }

  return res.status(200).json({
    message: "Welcome to the secret admin zone!",
    user_id: req.user.id,
  });
});

module.exports = router;
