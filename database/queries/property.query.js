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
    SELECT 
      p.*,
      GROUP_CONCAT(
        DISTINCT pi.image_url 
        ORDER BY pi.uploaded_at ASC 
        SEPARATOR ','
      ) AS image_urls
    FROM properties p
    LEFT JOIN property_images pi ON p.property_id = pi.property_id
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
        AND p.property_id IN (
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

  // Group by property to handle multiple images
  sql += ' GROUP BY p.property_id';
  sql += ' ORDER BY p.created_at DESC';

  const properties = await query(sql, params);

  
  // Transform the results to parse image URLs into an array
  return properties.map(property => ({
    ...property,
    image_urls: property.image_urls ? property.image_urls.split(',') : [],
    // Add a primary image URL for convenience
    primary_image: property.image_urls ? property.image_urls.split(',')[0] : null
  }));
};

// ====================== READ - HOMEPAGE PROPERTIES (FEATURED & LATEST) ======================
// queries/propertyQuery.js
const getPropertiesByCriteria = async ({ featured = false, limit = 3 }) => {
  // 1. Ensure limit is a valid integer to avoid SQL driver confusion
  const cleanLimit = parseInt(limit, 10) || 3;

  let sql = `
    SELECT p.* 
    FROM properties p 
    WHERE p.status = 'active' 
    AND p.availability_status = 'available'
  `;
  const params = [];

  if (featured) {
    sql += " AND p.featured = 1 ORDER BY RAND()";
  } else {
    sql += " ORDER BY p.created_at DESC";
  }

  // Add the limit placeholder
  sql += " LIMIT ?";
  params.push(cleanLimit);

  // 2. Execute Property Query
  // Note: I added a console.log here to help you debug if it fails again
  
  
  const properties = await query(sql, params);
  
  if (!properties || properties.length === 0) return [];

  // 3. Fetch Images
  const ids = properties.map(p => p.property_id);
  
  // Create placeholders (?, ?, ?) based on number of IDs
  const placeholders = ids.map(() => '?').join(',');
  
  const imgSql = `
    SELECT property_id, image_url 
    FROM property_images 
    WHERE property_id IN (${placeholders})
    ORDER BY uploaded_at ASC
  `;

  const allImages = await query(imgSql, ids);


  // 4. Map images into their respective property objects
  return properties.map(p => ({
    ...p,
    images: allImages
      .filter(img => img.property_id === p.property_id)
      .map(img => img.image_url)
  }));
};

const getUniqueLocations = async () => {
  const sql = `
    SELECT DISTINCT city 
    FROM properties 
    WHERE status = 'active' AND availability_status = 'available'
    ORDER BY city ASC
  `;
  return await query(sql);
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
  getPropertiesByCriteria,
  getUniqueLocations,
};