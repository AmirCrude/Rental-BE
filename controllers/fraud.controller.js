const fraudService = require("../services/fraud.service");

const predictFraud = async (req, res) => {
  try {
    const result = await fraudService.checkFraud(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { predictFraud };