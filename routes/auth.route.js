const express = require("express");
const router = express.Router();

// Controller
const {
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/auth.controller");

// Middlewares 
const {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator, 
} = require("../middlewares/validators/auth.validate");

// authentication
const { authMiddleware } = require("../middlewares/auth/auth.middleware");
const { checkJson } = require("../middlewares/auth/checkJson.middleware");

// Auth Routes

// login route
router.post("/login", checkJson, loginValidator, loginUser);


// forget password
router.post("/forgot-password", checkJson, forgotPasswordValidator, forgotPassword);

// reset password 
router.post("/reset-password", checkJson, resetPasswordValidator, resetPassword);

// change password 
router.post(
  "/change-password",
  changePasswordValidator,
  authMiddleware, 
  checkJson,
  changePassword
);

module.exports = router;
