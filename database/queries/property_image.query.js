const { query } = require("../../utils/connection/connections");

// Property Images query module
// Handles all CRUD operations for the property_images table
// Follows exact pattern from property.query.js and register.query.js

// ====================== CREATE PROPERTY IMAGE ======================
const createPropertyImage = async (propertyId, image_url, public_id) => {
  const sql = `
    INSERT INTO property_images 
    (property_id, image_url, cloudinary_public_id)
    VALUES (?, ?, ?)
  `;
  const params = [propertyId, image_url, public_id];

  const result = await query(sql, params);

  // Return the newly inserted image (full object)
  const [image] = await query("SELECT * FROM property_images WHERE image_id = ?", [
    result.insertId,
  ]);
  return image;
};

// ====================== READ - ALL IMAGES FOR A PROPERTY ======================
const getImagesByPropertyId = async (propertyId) => {
  const sql = `
    SELECT * FROM property_images 
    WHERE property_id = ?
  `;
  const images = await query(sql, [propertyId]);
  return images;
};

// ====================== READ - SINGLE IMAGE ======================
const getImageById = async (imageId) => {
  const sql = 'SELECT * FROM property_images WHERE id = ?';
  const [image] = await query(sql, [imageId]);
  return image;
};

// ====================== DELETE PROPERTY IMAGE ======================
const deletePropertyImage = async (imageId) => {
  const sql = 'DELETE FROM property_images WHERE id = ?';
  const result = await query(sql, [imageId]);
  return result.affectedRows > 0;
};

module.exports = {
  createPropertyImage,
  getImagesByPropertyId,
  getImageById,
  deletePropertyImage,
};