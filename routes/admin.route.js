const express = require("express");
const router = express.Router();

const {
  getStats,
  getUsers,
  getProperties,
  getFlagged,
  updatePropertyStatus,
  banUser,
  unbanUser,
} = require("../controllers/admin.controller");

const { authMiddleware } = require("../middlewares/auth/auth.middleware");
const { adminAuthMiddleware } = require("../middlewares/auth/admin.auth.middleware");
const fraudQuery = require("../database/queries/fraud.query");  // ADD THIS LINE

// All admin routes require auth + admin role
router.use(authMiddleware, adminAuthMiddleware);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.get("/properties", getProperties);
router.get("/flagged", getFlagged);

router.put("/properties/:id/status", updatePropertyStatus);
router.put("/users/:id/ban", banUser);
router.put("/users/:id/unban", unbanUser);

// Delete fraud flag when keeping a property
router.delete("/flagged/:propertyId", async (req, res) => {
  try {
    await fraudQuery.deleteFraudFlagByProperty(req.params.propertyId);
    res.json({ success: true, message: "Fraud flag removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;