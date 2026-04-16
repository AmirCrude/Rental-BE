const { query } = require("../../utils/connection/connections");

// Property Amenity query module
// Handles linking operations for the property_amenities junction table
// Follows exact pattern from property.query.js and property_image.query.js

// ====================== READ - ALL AVAILABLE AMENITIES ======================
const getAllAmenities = async () => {
  const sql = 'SELECT * FROM amenities ORDER BY name ASC';
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
  const [amenity] = await query('SELECT * FROM amenities WHERE id = ?', [amenityId]);
  return amenity;
};

// ====================== READ - AMENITIES LINKED TO A PROPERTY ======================
const getAmenitiesByPropertyId = async (propertyId) => {
  const sql = `
    SELECT a.* 
    FROM amenities a
    JOIN property_amenities pa ON a.id = pa.amenity_id
    WHERE pa.property_id = ?
    ORDER BY a.name ASC
  `;
  const amenities = await query(sql, [propertyId]);
  return amenities;
};

// ====================== DELETE LINK ======================
const deletePropertyAmenity = async (propertyId, amenityId) => {
  const sql = 'DELETE FROM property_amenities WHERE property_id = ? AND amenity_id = ?';
  const result = await query(sql, [propertyId, amenityId]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllAmenities,
  createPropertyAmenity,
  getAmenitiesByPropertyId,
  deletePropertyAmenity,
};