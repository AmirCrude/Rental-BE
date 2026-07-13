const express = require("express");
const router = express.Router();
const { predictFraud } = require("../controllers/fraud.controller");
const { authMiddleware } = require("../middlewares/auth/auth.middleware");

router.post("/predict", authMiddleware, predictFraud);

module.exports = router;