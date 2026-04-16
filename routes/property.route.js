const express = require("express");
const router = express.Router();

const {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
} = require("../controllers/property.controller.js");

// Middleware
const { checkJson } = require("../middlewares/auth/checkJson.middleware.js");
const { authMiddleware } = require("../middlewares/auth/auth.middleware.js");

// ====================== PUBLIC ROUTES (tenants can browse) ======================
router.get("/", getAllProperties);
router.get("/:id", getPropertyById);

// ====================== PROTECTED ROUTES (landlords only) ======================
router.post("/", checkJson, authMiddleware, createProperty);
router.get("/my", authMiddleware, getMyProperties);
router.put("/:id", checkJson, authMiddleware, updateProperty);
router.delete("/:id", authMiddleware, deleteProperty);

module.exports = router;