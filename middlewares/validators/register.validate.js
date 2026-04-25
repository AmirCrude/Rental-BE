const Joi = require("joi");

// ---------------------
// Registration schema
const registrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone_number: Joi.string().max(20).required(),
  name: Joi.string().max(100).required(),
  role: Joi.string().max(100).required(),
});

// ---------------------
// Middleware to validate registration
const validateRegistration = (req, res, next) => {
  const { error } = registrationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = {
  validateRegistration,
};
