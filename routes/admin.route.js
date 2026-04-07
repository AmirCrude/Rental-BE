const express = require("express");
const router = express.Router();

// Controller
const { createGovernmentOfficial } = require("../controllers/admin.controller");

// Validator
const {
  validateCreateGovernmentOfficial,
} = require("../middlewares/validators/admin.validate");

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
  checkJson,
  validateCreateGovernmentOfficial,
  createGovernmentOfficial
);

module.exports = router;
