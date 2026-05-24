const adminQuery = require("../database/queries/admin.query");

const getStats = async () => {
  return await adminQuery.getPlatformStats();
};

const getUsers = async (filters) => {
  return await adminQuery.getAllUsers(filters);
};

const getProperties = async (filters) => {
  return await adminQuery.getAllPropertiesAdmin(filters);
};

const getFlagged = async () => {
  return await adminQuery.getFlaggedProperties();
};

const updatePropertyStatus = async (propertyId, status) => {
  if (!["active", "flagged", "removed"].includes(status)) {
    throw new Error("Invalid status");
  }
  return await adminQuery.updatePropertyStatus(propertyId, status);
};

const banUser = async (userId) => {
  return await adminQuery.updateUserStatus(userId, "banned");
};

const unbanUser = async (userId, originalRole) => {
  return await adminQuery.updateUserStatus(userId, originalRole);
};

const getActivity = async () => {
  return await adminQuery.getRecentActivity();
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