const express = require("express");

// Import route modules
const authRouter = require("./auth.route");
const adminRouter = require("./admin.route");
const registerRouter = require("./register.route");
const propertyRouter = require("./property.route");
const propertyImageRouter = require("./property_image.route");
const propertyAmenityRouter = require("./property_amenity.route");
const { getHomepageProperties } = require("./../controllers/property.controller.js");
const { getUserById } = require("../controllers/user.controller.js");
const bookingRouter = require("./booking.route");
const aiRouter = require("./ai.route");

const router = express.Router();

// Homepage route - returns featured and latest properties for the homepage
router.get("/homepage", getHomepageProperties);
router.get("/users/:id", getUserById)

// Mount route modules
router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use(registerRouter);
router.use("/properties", propertyRouter);
router.use("/properties", propertyImageRouter);
router.use("/properties", propertyAmenityRouter);
router.use("/amenities", propertyAmenityRouter);
router.use("/bookings", bookingRouter);
router.use("/admin", adminRouter);
router.use("/ai", aiRouter);




module.exports = router;