const express = require("express");
const router = express.Router();

// Controller

// Validator

// Authentication & Role
const { authMiddleware } = require("../middlewares/auth/auth.middleware");
const { requireAdmin } = require("../middlewares/auth/admin.auth.middleware");
const { checkJson } = require("../middlewares/auth/checkJson.middleware");

// Admin Routes

// Create government official
router.post(
  "/government-official",
  authMiddleware,
  requireAdmin,
  checkJson
);

module.exports = router;
