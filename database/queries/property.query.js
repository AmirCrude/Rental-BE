const { query } = require("../../utils/connection/connections");

// Property query module
// Handles all CRUD operations for the properties table
// Follows exact pattern from register.query.js

// ====================== CREATE PROPERTY ======================
const createProperty = async (propertyData) => {
  const sql = `
    INSERT INTO properties 
    (landlord_id, title, description, price, city, district, property_type, 
     bedrooms, bathrooms, size, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    propertyData.landlord_id,
    propertyData.title,
    propertyData.description,
    propertyData.price,
    propertyData.city,
    propertyData.district,
    propertyData.property_type,
    propertyData.bedrooms,
    propertyData.bathrooms,
    propertyData.size,
    propertyData.status || 'active'
  ];

  const result = await query(sql, params);

  // Return the newly inserted property (full object with id + timestamps)
  const [property] = await query("SELECT * FROM properties WHERE id = ?", [
    result.insertId,
  ]);
  return property;
};

// ====================== READ - ALL PROPERTIES (with filters) ======================
const getAllProperties = async (filters = {}) => {
  let sql = `
    SELECT * FROM properties 
    WHERE status = 'active'
  `;
  const params = [];

  if (filters.city) {
    sql += ' AND city = ?';
    params.push(filters.city);
  }
  if (filters.district) {
    sql += ' AND district = ?';
    params.push(filters.district);
  }
  if (filters.min_price) {
    sql += ' AND price >= ?';
    params.push(parseFloat(filters.min_price));
  }
  if (filters.max_price) {
    sql += ' AND price <= ?';
    params.push(parseFloat(filters.max_price));
  }
  if (filters.property_type) {
    sql += ' AND property_type = ?';
    params.push(filters.property_type);
  }
  if (filters.min_bedrooms) {
    sql += ' AND bedrooms >= ?';
    params.push(parseInt(filters.min_bedrooms));
  }

  sql += ' ORDER BY created_at DESC';

  const properties = await query(sql, params);
  return properties;
};

// ====================== READ - SINGLE PROPERTY ======================
const getPropertyById = async (id) => {
  const sql = 'SELECT * FROM properties WHERE id = ?';
  const [property] = await query(sql, [id]);
  return property;
};

// ====================== READ - LANDLORD'S OWN PROPERTIES ======================
const getPropertiesByLandlordId = async (landlordId) => {
  const sql = 'SELECT * FROM properties WHERE landlord_id = ? ORDER BY created_at DESC';
  const properties = await query(sql, [landlordId]);
  return properties;
};

// ====================== UPDATE PROPERTY ======================
const updateProperty = async (id, propertyData) => {
  const sql = `
    UPDATE properties 
    SET title = ?, description = ?, price = ?, city = ?, district = ?, 
        property_type = ?, bedrooms = ?, bathrooms = ?, size = ?, 
        status = ?, updated_at = NOW()
    WHERE id = ?
  `;
  const params = [
    propertyData.title,
    propertyData.description,
    propertyData.price,
    propertyData.city,
    propertyData.district,
    propertyData.property_type,
    propertyData.bedrooms,
    propertyData.bathrooms,
    propertyData.size,
    propertyData.status || 'active',
    id
  ];

  const result = await query(sql, params);

  if (result.affectedRows === 0) {
    return null;
  }

  // Return the updated property (full object)
  const [updatedProperty] = await query('SELECT * FROM properties WHERE id = ?', [id]);
  return updatedProperty;
};

// ====================== DELETE PROPERTY ======================
const deleteProperty = async (id) => {
  const sql = 'DELETE FROM properties WHERE id = ?';
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getPropertiesByLandlordId,
  updateProperty,
  deleteProperty,
};