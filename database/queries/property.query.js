const { query } = require("../../utils/connection/connections");

// Property query module
// Handles all CRUD operations for the properties table
// Follows exact pattern from register.query.js

// ====================== CREATE PROPERTY ======================
const createProperty = async (propertyData) => {
  const sql = `
    INSERT INTO properties 
    (landlord_id, title, description, price, city, district, property_type, 
     bedrooms, bathrooms, size, floor_number, status, availability_status, created_at, featured, latitude, longitude)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 0, ?, ?)
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
    propertyData.floor_number || null,  // ADD THIS
    propertyData.status || 'active',
    propertyData.availability_status || 'available',
    propertyData.latitude || null,
    propertyData.longitude || null
  ];

  const result = await query(sql, params);

  const [property] = await query("SELECT * FROM properties WHERE property_id = ?", [
    result.insertId,
  ]);
  return property;
};

// ====================== READ - ALL PROPERTIES (FULL FILTERING) ======================
const getAllProperties = async (filters = {}) => {
  // 1. Pagination Setup
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 12;
  const offset = (page - 1) * limit;

  // 2. Build the WHERE clause and params for both Data and Count queries
  let whereClause = " WHERE 1=1";
  const queryParams = [];

  if (filters.city) {
    whereClause += ' AND p.city = ?';
    queryParams.push(filters.city);
  }
  if (filters.district) {
    whereClause += ' AND p.district = ?';
    queryParams.push(filters.district);
  }
  if (filters.min_price) {
    whereClause += ' AND p.price >= ?';
    queryParams.push(parseFloat(filters.min_price));
  }
  if (filters.max_price) {
    whereClause += ' AND p.price <= ?';
    queryParams.push(parseFloat(filters.max_price));
  }
  if (filters.property_type) {
    whereClause += ' AND p.property_type = ?';
    queryParams.push(filters.property_type);
  }
  if (filters.min_bedrooms) {
    whereClause += ' AND p.bedrooms >= ?';
    queryParams.push(parseInt(filters.min_bedrooms));
  }

  if (filters.search) {
    whereClause += ' AND (p.title LIKE ? OR p.city LIKE ? OR p.district LIKE ?)';
    const searchPattern = `%${filters.search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern);
  }

  // Status Filter - Always show only active properties
  whereClause += " AND p.status = 'active'";

  // Availability Filter - Default to available unless specified
  if (filters.availability_status) {
    whereClause += ' AND p.availability_status = ?';
    queryParams.push(filters.availability_status);
  } else {
    whereClause += " AND p.availability_status = 'available'";
  }

  // Amenities Filter
  if (filters.amenities) {
    const amenityIds = filters.amenities.split(',').map(id => id.trim()).filter(Boolean);
    if (amenityIds.length > 0) {
      whereClause += `
        AND p.property_id IN (
          SELECT pa.property_id 
          FROM property_amenities pa 
          WHERE pa.amenity_id IN (${amenityIds.map(() => '?').join(',')})
          GROUP BY pa.property_id 
          HAVING COUNT(DISTINCT pa.amenity_id) = ?
        )
      `;
      queryParams.push(...amenityIds, amenityIds.length);
    }
  }

  // 3. Get TOTAL COUNT for pagination
  const countSql = `SELECT COUNT(*) as total FROM properties p ${whereClause}`;
  const countRes = await query(countSql, queryParams);
  const totalItems = countRes[0]?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  // 4. Fetch the specific page of properties
  let dataSql = `SELECT p.* FROM properties p ${whereClause}`;
  dataSql += " ORDER BY p.created_at DESC LIMIT ? OFFSET ?";
  
  const properties = await query(dataSql, [...queryParams, limit, offset]);

  if (properties.length === 0) {
    return { data: [], totalItems, totalPages, currentPage: page };
  }

  // 5. Fetch and Optimize Images for the returned properties
  const propertyIds = properties.map(p => p.property_id);
  const imagesSql = `
    SELECT property_id, image_url 
    FROM property_images 
    WHERE property_id IN (${propertyIds.map(() => '?').join(',')})
    ORDER BY uploaded_at ASC
  `;
  
  const allImages = await query(imagesSql, propertyIds);

  // 6. Map images to properties with Cloudinary Optimization
  const propertiesWithImages = properties.map(p => {
    const pImages = allImages
      .filter(img => img.property_id === p.property_id)
      .map(img => img.image_url.replace('/upload/', '/upload/c_fill,g_auto,w_500,h_350,f_auto,q_auto/'));
    
    return { 
      ...p, 
      images: pImages, 
      mainImage: pImages.length > 0 ? pImages[0] : null 
    };
  });

  // 7. Return unified response object
  return {
    data: propertiesWithImages,
    totalItems,
    totalPages,
    currentPage: page
  };
};

const getAllPropertiesMap = async () => {
  // 1. Fetch ALL active properties with no filters
  let dataSql = `
    SELECT p.* 
    FROM properties p 
    WHERE p.status = 'active'
    ORDER BY p.created_at DESC
  `;
  
  const properties = await query(dataSql);

  // 2. Return all properties directly (no images needed for map)
  return {
    data: properties,
    totalItems: properties.length,
    totalPages: 1,
    currentPage: 1
  };
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
  return properties.map(p => {
    // Filter images belonging to this property
    const propertyImages = allImages
      .filter(img => img.property_id === p.property_id)
      .map(img => img.image_url);

    return {
      ...p,
      images: propertyImages,
      // NEW: Set the first image as mainImage, or null if no images exist
      mainImage: propertyImages.length > 0 ? propertyImages[0] : null
    };
  });
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
  const rows = await query(sql, [id]); // Assuming your query() returns rows directly

  if (!rows || rows.length === 0) return null;
  
  return rows[0]; // Return the OBJECT, not the array
};


// ====================== READ - LANDLORD'S OWN PROPERTIES ======================
const getPropertiesByLandlordId = async (landlordId) => {
  const sql = 'SELECT * FROM properties WHERE landlord_id = ? ORDER BY created_at DESC';
  const properties = await query(sql, [landlordId]);
  return properties;
};

// ====================== UPDATE PROPERTY ======================
const updateProperty = async (id, propertyData) => {
  // Define allowed columns to prevent SQL injection or accidental updates
  const allowedColumns = [
    'title', 'description', 'price', 'city', 'district', 
    'property_type', 'bedrooms', 'bathrooms', 'size', 
    'status', 'availability_status', 'featured'
  ];

  // 1. Filter entries to only include allowed columns and defined values
  const entries = Object.entries(propertyData).filter(
    ([key, value]) => allowedColumns.includes(key) && value !== undefined
  );
  
  if (entries.length === 0) return null;

  // 2. Build Dynamic SQL
  const setClause = entries.map(([key]) => `${key} = ?`).join(', ');
  const params = entries.map(([_, value]) => value);
  params.push(id);

  const sql = `UPDATE properties SET ${setClause} WHERE property_id = ?`;

  const result = await query(sql, params);

  if (result.affectedRows === 0) return null;

  // 3. Return the single updated object
  const rows = await query('SELECT * FROM properties WHERE property_id = ?', [id]);
  return rows; // Return the object, not the array
};


// ====================== DELETE PROPERTY ======================
const deleteProperty = async (id) => {
  const sql = 'DELETE FROM properties WHERE property_id = ?';
  const result = await query(sql, [id]);
  return result.affectedRows > 0;
};

const updatePropertyStatus = async (propertyId, status) => {
  await query(
    "UPDATE properties SET availability_status = ? WHERE property_id = ?",
    [status, propertyId]
  );
  const [property] = await query("SELECT * FROM properties WHERE property_id = ?", [propertyId]);
  return property;
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
  getAllPropertiesMap,
  updatePropertyStatus,
};