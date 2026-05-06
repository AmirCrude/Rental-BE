const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  getAllAmenities,
  getPropertyAmenities,
  createPropertyAmenity,
  updatePropertyAmenities, 
  deletePropertyAmenity,
} = require("../controllers/property_amenity.controller.js");

// Middleware
const { checkJson } = require("../middlewares/auth/checkJson.middleware.js");
const { authMiddleware } = require("../middlewares/auth/auth.middleware.js");

// ====================== PUBLIC ROUTES ======================
router.get("/", getAllAmenities);                    // GET /properties/amenities
router.get("/:propertyId/amenities", getPropertyAmenities);   // GET /properties/123/amenities

// ====================== PROTECTED ROUTES (landlord only) ======================

router.put(
  "/:propertyId/amenities",
  checkJson,
  authMiddleware,
  updatePropertyAmenities
);

router.post(
  "/:propertyId/amenities",
  checkJson,
  authMiddleware,
  createPropertyAmenity
);



router.delete(
  "/:propertyId/amenities/:amenityId",
  authMiddleware,
  deletePropertyAmenity
);

module.exports = router;