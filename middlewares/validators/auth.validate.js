const Joi = require("joi");

//Joi Schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().alphanum().min(8).max(50).required(),
}).messages({
  "string.email": "Please enter a valid email address",
  "string.alphanum": "Password must only contain letters and numbers",
  "string.min": "Password must be at least 8 characters long",
  "string.max": "Password cannot be longer than 50 characters",
  "any.required": "Email and password are required",
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().max(100).required(),
}).messages({
  "string.email": "Please enter a valid email address",
  "string.max": "Email cannot be longer than 100 characters",
  "any.required": "Email is required",
});

// Reset password (forgot password flow) only validates newPassword and token
const resetPasswordSchema = Joi.object({
  newPassword: Joi.string().alphanum().min(8).max(50).required().messages({
    "string.alphanum": "New password must only contain letters and numbers",
    "string.min": "New password must be at least 8 characters long",
    "string.max": "New password cannot be longer than 50 characters",
    "any.required": "New password is required",
  }),
  token: Joi.string().required().messages({
    "string.base": "Token must be a string",
    "any.required": "Token is required",
  }),
});

// Change password (logged-in user) validates oldPassword and newPassword
const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().alphanum().min(8).max(50).required().messages({
    "string.alphanum": "Old password must only contain letters and numbers",
    "string.min": "Old password must be at least 8 characters long",
    "string.max": "Old password cannot be longer than 50 characters",
    "any.required": "Old password is required",
  }),
  newPassword: Joi.string().alphanum().min(8).max(50).required().messages({
    "string.alphanum": "New password must only contain letters and numbers",
    "string.min": "New password must be at least 8 characters long",
    "string.max": "New password cannot be longer than 50 characters",
    "any.required": "New password is required",
  }),
});

// Middleware Validators
const loginValidator = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  next();
};

const forgotPasswordValidator = (req, res, next) => {
  const { error } = forgotPasswordSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  next();
};

const resetPasswordValidator = (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  next();
};

const changePasswordValidator = (req, res, next) => {
  const { error } = changePasswordSchema.validate(req.body);
  if (error)
    return res
      .status(400)
      .json({ status: "error", message: error.details[0].message });
  next();
};

module.exports = {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
};
