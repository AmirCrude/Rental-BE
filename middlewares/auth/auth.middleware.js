const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  //  Checking Authorization Header
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({
      status: "error",
      message: "You must be logged in to access this page",
    });
  }

  // Extracting the Token
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      status: "error",
      message: "Your login session is not valid. Please log in again",
    });
  }
  const token = parts[1];

  //  Verifying the Token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.userId,
      ...decoded,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Your session has expired. Please log in again.",
    });
  }
};

module.exports = { authMiddleware };
