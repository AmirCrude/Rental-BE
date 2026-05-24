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
  getActivity,
} = require("../controllers/admin.controller");

const { authMiddleware } = require("../middlewares/auth/auth.middleware");
const { adminAuthMiddleware } = require("../middlewares/auth/admin.auth.middleware");

// All admin routes require auth + admin role
router.use(authMiddleware, adminAuthMiddleware);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.get("/properties", getProperties);
router.get("/flagged", getFlagged);
router.get("/activity", getActivity);

router.put("/properties/:id/status", updatePropertyStatus);
router.put("/users/:id/ban", banUser);
router.put("/users/:id/unban", unbanUser);

module.exports = router;