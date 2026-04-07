/**
 * Cloudinary Image Service
 *
 * 1. uploadImage(fileBuffer)
 *    - Uploads an image buffer to Cloudinary.
 *    - Returns the upload result (secure_url, public_id, etc.).
 *
 * 2. updateImage(newFileBuffer, oldPublicId)
 *    - Uploads a new image and deletes the old one (if provided).
 *    - Returns the new upload result.
 *
 * 3. deleteImage(publicId)
 *    - Deletes an image from Cloudinary by public_id.
 *    - Returns the deletion result.
 */

const cloudinary = require("../configs/cloudinary.config.js");

const uploadImage = async (fileBuffer) => {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error("Invalid file buffer.");
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

const deleteImage = async (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      publicId,
      { resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
  });
};

const updateImage = async (newFileBuffer, oldPublicId = null) => {
  const uploadResult = await uploadImage(newFileBuffer);

  if (oldPublicId) {
    try {
      await deleteImage(oldPublicId);
    } catch (error) {
      console.warn("Failed to delete old image:", error.message);
    }
  }

  return uploadResult;
};

module.exports = {
  uploadImage,
  updateImage,
  deleteImage,
};
