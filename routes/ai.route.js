const express = require("express");
const router = express.Router();

const {
  generateDescription,
  enhanceSearch,
} = require("../controllers/ai.controller");

const { authMiddleware } = require("../middlewares/auth/auth.middleware");

// Generate description (authenticated)
router.post("/generate-description", authMiddleware, generateDescription);

// Enhance search (public)
router.get("/enhance-search", enhanceSearch);

module.exports = router;