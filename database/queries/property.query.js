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

  const [property] = await query("SELECT * FROM properties WHERE id = ?", [
    result.insertId,
  ]);
  return property;
};

// ====================== READ - ALL PROPERTIES (FULL FILTERING) ======================
const getAllProperties = async (filters = {}) => {
  let sql = `
    SELECT p.* FROM properties p
    WHERE 1=1
  `;
  const params = [];

  // Existing filters
  if (filters.city) {
    sql += ' AND p.city = ?';
    params.push(filters.city);
  }
  if (filters.district) {
    sql += ' AND p.district = ?';
    params.push(filters.district);
  }
  if (filters.min_price) {
    sql += ' AND p.price >= ?';
    params.push(parseFloat(filters.min_price));
  }
  if (filters.max_price) {
    sql += ' AND p.price <= ?';
    params.push(parseFloat(filters.max_price));
  }
  if (filters.property_type) {
    sql += ' AND p.property_type = ?';
    params.push(filters.property_type);
  }
  if (filters.min_bedrooms) {
    sql += ' AND p.bedrooms >= ?';
    params.push(parseInt(filters.min_bedrooms));
  }

  // NEW: availability_status (maps to property.status)
  if (filters.availability_status) {
    sql += ' AND p.status = ?';
    params.push(filters.availability_status);
  } else {
    // Default for tenants: only active properties
    sql += " AND p.status = 'active'";
  }

  // NEW: amenities filtering (comma-separated IDs, e.g. ?amenities=1,3,5)
  // Properties must have ALL requested amenities
  if (filters.amenities) {
    const amenityIds = filters.amenities.split(',').map(id => id.trim()).filter(Boolean);
    if (amenityIds.length > 0) {
      sql += `
        AND p.id IN (
          SELECT pa.property_id 
          FROM property_amenities pa 
          WHERE pa.amenity_id IN (${amenityIds.map(() => '?').join(',')})
          GROUP BY pa.property_id 
          HAVING COUNT(DISTINCT pa.amenity_id) = ?
        )
      `;
      params.push(...amenityIds, amenityIds.length);
    }
  }

  sql += ' ORDER BY p.created_at DESC';

  const properties = await query(sql, params);
  return properties;
};

// ====================== READ - SINGLE PROPERTY ======================
const getPropertyById = async (id) => {
  const sql = 'SELECT * FROM properties WHERE property_id = ?';
  
  // 1. Destructure to get the rows (the first element of the result)
  const [rows] = await query(sql, [id]);

  // 2. Check if the property actually exists
  if (!rows || rows.length === 0) {
    return null; // Or throw an error if your service layer expects one
  }

  console.log("Fetched property rows:", rows); // Debugging log to see the raw result
  // 3. Return only the single object (the first row)
  return rows; 
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