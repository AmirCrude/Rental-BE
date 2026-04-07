// Middleware to allow only super admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "You must be logged in to access this page",
    });
  }

  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      status: "error",
      message: "Access denied. Only admins can perform this action.",
    });
  }

  next();
};

module.exports = { requireAdmin };
