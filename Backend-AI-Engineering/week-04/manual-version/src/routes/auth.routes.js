const express = require("express");
const service = require("../services/auth.services");
const { requireAuth } = require("../middleware/auth.middleware");

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

router.post("/auth/refresh", async (req, res, next) => {
  try {
    const result = await service.refreshUserToken(req.app.supabase, req.body ?? {});
    return res.status(200).json(result);
  } catch (err) {
    if (err.status === 401 || err.message === "Invalid or expired refresh token") {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
    next(err);
  }
});

router.post("/auth/logout", requireAuth, async (req, res, next) => {
  try {
    await req.app.supabase.auth.signOut();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
