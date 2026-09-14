import express from "express";

import {
  register,
  login,
  logout,
  getMe
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  loginRateLimiter,
  registerRateLimiter
} from "../middleware/rateLimiters.js";

const router =
  express.Router();

router.post(
  "/register",
  registerRateLimiter,
  register
);

router.post(
  "/login",
  loginRateLimiter,
  login
);

router.post(
  "/logout",
  logout
);

router.get(
  "/me",
  authMiddleware,
  getMe
);

export default router;