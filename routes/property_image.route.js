const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  createPropertyImage,
  getPropertyImages,
  deletePropertyImage,
} = require("../controllers/property_image.controller.js");
const { authMiddleware } = require("../middlewares/auth/auth.middleware.js");
const { uploadArrayImagesMiddleware } = require("../middlewares/upload/upload.image.middleware.js");

router.get("/:propertyId/images", getPropertyImages);

router.post(
  "/:propertyId/images",
  authMiddleware,
  uploadArrayImagesMiddleware, // Updated to Array
  createPropertyImage
);

router.delete("/:propertyId/images/:imageId", authMiddleware, deletePropertyImage);

module.exports = router;
