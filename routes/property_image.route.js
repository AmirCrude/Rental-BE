const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  createPropertyImage,
  getPropertyImages,
  deletePropertyImage,
} = require("../controllers/property_image.controller.js");

// Middleware
const { authMiddleware } = require("../middlewares/auth/auth.middleware.js");
const uploadImageMiddleware = require("../middlewares/upload/upload.image.middleware.js");

// ====================== PUBLIC ROUTE ======================
router.get("/:propertyId/images", getPropertyImages);

// ====================== PROTECTED ROUTES (landlord only) ======================
router.post(
  "/:propertyId/images",
  authMiddleware,
  uploadImageMiddleware,
  createPropertyImage
);

router.delete(
  "/:propertyId/images/:imageId",
  authMiddleware,
  deletePropertyImage
);

module.exports = router;