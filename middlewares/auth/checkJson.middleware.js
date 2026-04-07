// middlewares/checkJson.middleware.js

const checkJson = (req, res, next) => {
  const contentType = req.headers["content-type"];

  // Check if Content-Type is application/json
  if (!contentType || !contentType.includes("application/json")) {
    return res.status(400).json({
      status: "error",
      message: "Request must have Content-Type: application/json",
    });
  }

  // Check if req.body exists (parsed by express.json())
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: "error",
      message: "Request body is required and must be valid JSON",
    });
  }

  next();
};

module.exports = { checkJson };
