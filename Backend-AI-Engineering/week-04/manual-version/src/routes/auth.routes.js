const express = require("express");
const service = require("../services/auth.services");

const router = express.Router();

router.post("/auth/signup", async (req, res, next) => {
  try {
    const result = await service.registerUser(req.app.supabase, req.body ?? {});
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/auth/login", async (req, res, next) => {
  try {
    const result = await service.loginUser(req.app.supabase, req.body ?? {});
    return res.status(200).json(result);
  } catch (err) {
    if (err.status === 401 || err.message === "Invalid login credentials") {
      return res.status(401).json({ error: "Invalid login credentials" });
    }
    next(err);
  }
});

module.exports = router;
