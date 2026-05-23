const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const { PROPERTIES_DIR, THUMBNAILS_DIR } = require("../configs/upload.config");

// Ensure directories exist
const ensureDirectories = async () => {
  await fs.mkdir(PROPERTIES_DIR, { recursive: true });
  await fs.mkdir(THUMBNAILS_DIR, { recursive: true });
};

// Generate unique filename
const generateFileName = (propertyId, originalName) => {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  const randomStr = crypto.randomBytes(4).toString("hex");
  return `property_${propertyId}_${timestamp}_${randomStr}${ext}`;
};

// Upload image to local storage
const uploadImage = async (fileBuffer, propertyId, originalName) => {
  await ensureDirectories();

  const fileName = generateFileName(propertyId, originalName);
  const filePath = path.join(PROPERTIES_DIR, fileName);

  await fs.writeFile(filePath, fileBuffer);

  return {
    fileName,
    filePath,
    public_id: fileName, // For backward compatibility
    secure_url: `/uploads/properties/${fileName}`, // Relative URL
    resource_type: "image",
  };
};

// Delete image from local storage
const deleteImage = async (fileName) => {
  const filePath = path.join(PROPERTIES_DIR, fileName);
  try {
    await fs.unlink(filePath);
    return { result: "ok" };
  } catch (error) {
    console.warn("Failed to delete file:", filePath, error.message);
    return { result: "not found" };
  }
};

// Update image (upload new, delete old)
const updateImage = async (newFileBuffer, propertyId, originalName, oldFileName = null) => {
  const uploadResult = await uploadImage(newFileBuffer, propertyId, originalName);

  if (oldFileName) {
    await deleteImage(oldFileName);
  }

  return uploadResult;
};

module.exports = {
  uploadImage,
  deleteImage,
  updateImage,
};