const adminService = require("../services/admin.service");

const getStats = async (req, res) => {
  try {
    const stats = await adminService.getStats();
    return res.json({ success: true, data: stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await adminService.getUsers(req.query);
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProperties = async (req, res) => {
  try {
    const properties = await adminService.getProperties(req.query);
    return res.json({ success: true, data: properties });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getFlagged = async (req, res) => {
  try {
    const flagged = await adminService.getFlagged();
    return res.json({ success: true, data: flagged });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updatePropertyStatus = async (req, res) => {
  try {
    const property = await adminService.updatePropertyStatus(req.params.id, req.body.status);
    return res.json({ success: true, data: property });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const banUser = async (req, res) => {
  try {
    const user = await adminService.banUser(req.params.id);
    return res.json({ success: true, data: user, message: "User banned" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const unbanUser = async (req, res) => {
  try {
    const user = await adminService.unbanUser(req.params.id, req.body.originalRole);
    return res.json({ success: true, data: user, message: "User unbanned" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const getActivity = async (req, res) => {
  try {
    const activity = await adminService.getActivity();
    return res.json({ success: true, data: activity });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  getProperties,
  getFlagged,
  updatePropertyStatus,
  banUser,
  unbanUser,
  getActivity,
};