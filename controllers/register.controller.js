// POST /api/register
const { registerUser } = require("../services/register.service");

const registerController = async (req, res) => {
  try {
    const file = req.file || null;

    const newUser = await registerUser({
      ...req.body,
      file,
    });

    return res.status(201).json({
      success: true,
      message: `${newUser.role} registered successfully`,

    });
  } catch (error) {
    console.error("Registration Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
};

module.exports = { registerController };
