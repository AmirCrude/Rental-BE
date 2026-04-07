const express = require("express");
const router = express.Router();
const { registerController } = require("../controllers/register.controller.js");

// Middleware to check JSON body
const { checkJson } = require("../middlewares/auth/checkJson.middleware.js");

// Middleware to handle file uploads for lawyer documents
const {
  uploadFileMiddleware,
} = require("../middlewares/upload/upload.file.middleware.js");

// Middleware to validate registration body
const {
  validateRegistration,
} = require("../middlewares/validators/register.validate.js");
const { authMiddleware } = require("../middlewares/auth/auth.middleware.js");

// POST /api/register - register citizen or lawyer
router.post(
  "/register",
  uploadFileMiddleware,
  validateRegistration,
  registerController
);

module.exports = router;
