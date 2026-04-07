const adminService = require("../services/admin.service");

// Create Government Official (Super Admin only)
const createGovernmentOfficial = async (req, res) => {
  try {
    // req.body already validated by Joi validator
    const result = await adminService.createGovernmentOfficial(req.body);

    res.status(201).json({
      status: "success",
      message:
        "Government official created successfully. Password sent via email.",
      data: result,
    });
  } catch (error) {
    console.error("Create Government Official Error:", error);
    res.status(400).json({
      status: "error",
      message: error.message || "Failed to create government official",
    });
  }
};

module.exports = {
  createGovernmentOfficial,
};
