const express = require("express");

// Import route modules

const authRouter = require("./auth.route");
const adminRouter = require("./admin.route");
const registerRouter = require("./register.route");
const propertyRouter = require("./property.route");
const propertyImageRouter = require("./property_image.route");
const propertyAmenityRouter = require("./property_amenity.route");
const { getHomepageProperties } = require("./../controllers/property.controller.js");
const router = express.Router();

// API routes

// Homepage route - returns featured and latest properties for the homepage
router.get("/", getHomepageProperties); 

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use(registerRouter);
router.use("/properties", propertyRouter);
router.use("/properties", propertyImageRouter);
router.use("/properties", propertyAmenityRouter);
router.use("/amenities", propertyAmenityRouter);


module.exports = router;
