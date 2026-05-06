const express = require("express");
const router = express.Router();

const {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getHomepageProperties,
  getAllPropertiesMap,
} = require("../controllers/property.controller.js");

// Middleware
const { checkJson } = require("../middlewares/auth/checkJson.middleware.js");
const { authMiddleware } = require("../middlewares/auth/auth.middleware.js");

// ====================== PUBLIC ROUTES (different paths!) ======================
router.get("/", getAllProperties);           // GET /api/properties?city=...&page=... (with filters)
router.get("/map", getAllPropertiesMap);      // GET /api/properties/map (all properties for map)
router.get("/homepage", getHomepageProperties); // GET /api/properties/homepage (featured/latest)

// ====================== PROTECTED ROUTES (landlords only) ======================
router.post("/", checkJson, authMiddleware, createProperty);
router.get("/my", authMiddleware, getMyProperties);
router.put("/:id", checkJson, authMiddleware, updateProperty);
router.delete("/:id", authMiddleware, deleteProperty);

// ====================== PUBLIC ROUTE TO GET PROPERTY DETAILS ======================
router.get("/:id", getPropertyById); // This must be LAST to not catch /map, /homepage, /my

module.exports = router;