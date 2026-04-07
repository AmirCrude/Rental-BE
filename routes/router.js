const express = require("express");

// Import route modules

const authRouter = require("./auth.route");
const adminRouter = require("./admin.route");
const registerRouter = require("./register.route");
const router = express.Router();

// API routes

router.use("/auth", authRouter);
router.use("/admin", adminRouter);
router.use(profileRouter);
router.use(registerRouter);
router.use(fileRouter);
router.use(reportRouter);
router.use(commentRouter);

module.exports = router;
