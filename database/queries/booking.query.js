const { query } = require("../../utils/connection/connections");

// Create a new booking
const createBooking = async (bookingData) => {
  const sql = `
    INSERT INTO bookings (property_id, tenant_id, status, created_at)
    VALUES (?, ?, 'pending', NOW())
  `;
  const result = await query(sql, [
    bookingData.property_id,
    bookingData.tenant_id,
  ]);

  const [booking] = await query("SELECT * FROM bookings WHERE booking_id = ?", [result.insertId]);
  return booking;
};

// Get booking by ID
const getBookingById = async (bookingId) => {
  const [booking] = await query("SELECT * FROM bookings WHERE booking_id = ?", [bookingId]);
  return booking;
};

// Get all bookings for a tenant
const getTenantBookings = async (tenantId) => {
  const sql = `
    SELECT b.*, p.title, p.price, p.city, p.district, p.bedrooms, p.bathrooms, p.size, p.floor_number,
           p.property_type, p.latitude, p.longitude,
           u.name as landlord_name, u.email as landlord_email, u.phone_number as landlord_phone,
           (SELECT pi.image_url FROM property_images pi WHERE pi.property_id = p.property_id LIMIT 1) as image_url
    FROM bookings b
    JOIN properties p ON b.property_id = p.property_id
    JOIN users u ON p.landlord_id = u.user_id
    WHERE b.tenant_id = ?
    ORDER BY b.created_at DESC
  `;
  return await query(sql, [tenantId]);
};

// Get all bookings for a landlord (across all their properties)
const getLandlordBookings = async (landlordId) => {
  const sql = `
    SELECT b.*, p.title, p.price, p.city, p.district, p.property_type,
           u.name as tenant_name, u.email as tenant_email, u.phone_number as tenant_phone,
           (SELECT pi.image_url FROM property_images pi WHERE pi.property_id = p.property_id LIMIT 1) as image_url
    FROM bookings b
    JOIN properties p ON b.property_id = p.property_id
    JOIN users u ON b.tenant_id = u.user_id
    WHERE p.landlord_id = ?
    ORDER BY b.created_at DESC
  `;
  return await query(sql, [landlordId]);
};

// Check if tenant already has a pending/approved booking for this property
const checkExistingBooking = async (tenantId, propertyId) => {
  const [result] = await query(
    `SELECT COUNT(*) as count FROM bookings 
     WHERE tenant_id = ? AND property_id = ? AND status IN ('pending', 'approved')`,
    [tenantId, propertyId]
  );
  return result.count > 0;
};

// Update booking status
const updateBookingStatus = async (bookingId, status) => {
  await query("UPDATE bookings SET status = ? WHERE booking_id = ?", [status, bookingId]);
  const [booking] = await query("SELECT * FROM bookings WHERE booking_id = ?", [bookingId]);
  return booking;
};

const getExistingBooking = async (tenantId, propertyId) => {
    return await query(
      `SELECT * FROM bookings WHERE tenant_id = ? AND property_id = ? LIMIT 1`,
      [tenantId, propertyId]
    );
  };

module.exports = {
  createBooking,
  getBookingById,
  getTenantBookings,
  getLandlordBookings,
  checkExistingBooking,
  updateBookingStatus,
  getExistingBooking,
};