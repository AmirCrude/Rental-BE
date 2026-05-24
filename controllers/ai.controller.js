const aiService = require("../services/ai.service");

const generateDescription = async (req, res) => {
  try {
    const description = await aiService.generateDescription(req.body);
    return res.json({
      success: true,
      data: { description },
    });
  } catch (error) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "AI generation failed",
    });
  }
};

const enhanceSearch = async (req, res) => {
  try {
    const enhanced = await aiService.enhanceSearch(req.query.q);
    return res.json({
      success: true,
      data: enhanced,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Search enhancement failed",
    });
  }
};

module.exports = {
  generateDescription,
  enhanceSearch,
};