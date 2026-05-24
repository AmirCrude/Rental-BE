const { query } = require("../../utils/connection/connections");

// Get platform stats
const getPlatformStats = async () => {
  const [propertyCount] = await query("SELECT COUNT(*) as total FROM properties WHERE status = 'active'");
  const [userCount] = await query("SELECT COUNT(*) as total FROM users");
  const [flaggedCount] = await query("SELECT COUNT(*) as total FROM properties WHERE status = 'flagged'");
  const [bookingCount] = await query("SELECT COUNT(*) as total FROM bookings");
  const [revenueResult] = await query(`
    SELECT COALESCE(SUM(p.price), 0) as total 
    FROM bookings b 
    JOIN properties p ON b.property_id = p.property_id 
    WHERE b.status = 'approved'
  `);

  return {
    totalProperties: propertyCount.total,
    totalUsers: userCount.total,
    flaggedProperties: flaggedCount.total,
    totalBookings: bookingCount.total,
    monthlyRevenue: revenueResult.total,
  };
};

// Get all users with filters
const getAllUsers = async (filters = {}) => {
  let whereClause = " WHERE 1=1";
  const params = [];

  if (filters.role) {
    whereClause += " AND role = ?";
    params.push(filters.role);
  }
  if (filters.search) {
    whereClause += " AND (name LIKE ? OR email LIKE ?)";
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  const sql = `SELECT user_id, name, email, phone_number, role, created_at FROM users ${whereClause} ORDER BY created_at DESC`;
  return await query(sql, params);
};

// Get all properties (admin view - includes all statuses)
const getAllPropertiesAdmin = async (filters = {}) => {
  let whereClause = " WHERE 1=1";
  const params = [];

  if (filters.status) {
    whereClause += " AND p.status = ?";
    params.push(filters.status);
  }
  if (filters.search) {
    whereClause += " AND (p.title LIKE ? OR p.city LIKE ? OR p.district LIKE ?)";
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  const sql = `
    SELECT p.*, u.name as landlord_name, u.email as landlord_email
    FROM properties p
    JOIN users u ON p.landlord_id = u.user_id
    ${whereClause}
    ORDER BY p.created_at DESC
  `;
  return await query(sql, params);
};

// Get flagged properties
const getFlaggedProperties = async () => {
  const sql = `
    SELECT p.*, u.name as landlord_name, ff.fraud_score, ff.reason
    FROM properties p
    JOIN users u ON p.landlord_id = u.user_id
    LEFT JOIN fraud_flags ff ON p.property_id = ff.property_id
    WHERE p.status = 'flagged'
    ORDER BY ff.fraud_score DESC
  `;
  return await query(sql);
};

// Update property status (flag/remove/activate)
const updatePropertyStatus = async (propertyId, status) => {
  await query("UPDATE properties SET status = ? WHERE property_id = ?", [status, propertyId]);
  const [property] = await query("SELECT * FROM properties WHERE property_id = ?", [propertyId]);
  return property;
};

// Ban/unban user
const updateUserStatus = async (userId, role) => {
  await query("UPDATE users SET role = ? WHERE user_id = ?", [role, userId]);
  const [user] = await query("SELECT user_id, name, email, role FROM users WHERE user_id = ?", [userId]);
  return user;
};

// Get recent activity
const getRecentActivity = async () => {
  const recentProperties = await query(
    "SELECT property_id, title, created_at FROM properties ORDER BY created_at DESC LIMIT 5"
  );
  const recentUsers = await query(
    "SELECT user_id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5"
  );
  const recentBookings = await query(
    `SELECT b.*, p.title, u.name as tenant_name 
     FROM bookings b 
     JOIN properties p ON b.property_id = p.property_id 
     JOIN users u ON b.tenant_id = u.user_id 
     ORDER BY b.created_at DESC LIMIT 5`
  );

  return { recentProperties, recentUsers, recentBookings };
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  getAllPropertiesAdmin,
  getFlaggedProperties,
  updatePropertyStatus,
  updateUserStatus,
  getRecentActivity,
};