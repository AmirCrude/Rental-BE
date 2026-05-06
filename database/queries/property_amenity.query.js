const { query } = require("../../utils/connection/connections");

// Property Amenity query module
// Handles linking operations for the property_amenities junction table
// Follows exact pattern from property.query.js and property_image.query.js

// ====================== READ - ALL AVAILABLE AMENITIES ======================
const getAllAmenities = async () => {
  const sql = 'SELECT * FROM amenities ORDER BY amenity_name ASC';
  const amenities = await query(sql);
  return amenities;
};

// ====================== CREATE LINK (PROPERTY <-> AMENITY) ======================
const createPropertyAmenity = async (propertyId, amenityId) => {
  const sql = `
    INSERT INTO property_amenities (property_id, amenity_id)
    VALUES (?, ?)
  `;
  const params = [propertyId, amenityId];

  await query(sql, params);

  // Return the full amenity details (for frontend convenience)
  const [amenity] = await query('SELECT * FROM amenities WHERE amenity_id = ?', [amenityId]);
  return amenity;
};

// ====================== READ - AMENITIES LINKED TO A PROPERTY ======================
const getAmenitiesByPropertyId = async (propertyId) => {
  const sql = `
    SELECT a.amenity_id, a.amenity_name 
    FROM amenities a
    JOIN property_amenities pa ON a.amenity_id = pa.amenity_id
    WHERE pa.property_id = ?
    ORDER BY a.amenity_name ASC
  `;
  // mysql2/promise returns [rows, fields], so destructure the rows
  const rows = await query(sql, [propertyId]);
  return rows; 
};

// Get all amenities for a property (you might already have this)
const getPropertyAmenities = async (propertyId) => {
  const sql = `
    SELECT a.* FROM amenities a
    INNER JOIN property_amenities pa ON a.amenity_id = pa.amenity_id
    WHERE pa.property_id = ?
  `;
  return await query(sql, [propertyId]);
};

// Delete all amenities for a property
const deleteAllPropertyAmenities = async (propertyId) => {
  const sql = 'DELETE FROM property_amenities WHERE property_id = ?';
  await query(sql, [propertyId]);
};


// ====================== DELETE LINK ======================
const deletePropertyAmenity = async (propertyId, amenityId) => {
  const sql = 'DELETE FROM property_amenities WHERE property_id = ? AND amenity_id = ?';
  await query(sql, [propertyId, amenityId]);
};

module.exports = {
  getAllAmenities,
  createPropertyAmenity,
  getAmenitiesByPropertyId,
  getPropertyAmenities,
  deletePropertyAmenity,
  deleteAllPropertyAmenities,

};