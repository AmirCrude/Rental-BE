const path = require("path");
const cloudinary = require("../configs/cloudinary.config.js");

const uploadFile = async (fileData) => {
  const { buffer, fileExtension, fileName } = fileData;

  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error("Invalid file buffer.");
  }

  // Determine resource type based on file extension
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp"];
  const resourceType = imageExtensions.includes(fileExtension)
    ? "image"
    : "raw";

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        public_id: fileName,
        overwrite: true,
        access_mode: "public",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve({
          ...result,
          resource_type: resourceType,
        });
      }
    );
    stream.end(buffer);
  });
};

/**
 * Deletes a file from Cloudinary.
 * @param {string} publicId - The public ID of the file to delete (without extension for this flow).
 * @param {string} resourceType - The resource type of the file ('image' or 'raw').
 * @returns {Promise<Object>} A promise that resolves with the deletion result.
 */
const deleteFile = async (publicId, resourceType) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(
      `${publicId}.${resourceType}`,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
  });
};

/**
 * Updates a file by uploading a new one and then deleting the old.
 * This ensures the new file is in place before removing the old one.
 * @param {Object} newFileData - The new file's data (buffer and filename).
 * @param {string} oldPublicId - The public ID of the file to be replaced.
 * @param {string} oldResourceType - The resource type of the file to be replaced.
 * @returns {Promise<Object>} A promise that resolves with the new file's upload metadata.
 */
const updateFile = async (
  newFileData,
  oldPublicId = null,
  oldResourceType = "image"
) => {
  // First, upload the new file.
  const newUploadResult = await uploadFile(newFileData);

  // If an old file exists, try to delete it.
  if (oldPublicId) {
    try {
      await deleteFile(oldPublicId, oldResourceType);
    } catch (error) {
      // Log a warning if deletion fails, but don't fail the entire update operation.
      console.warn("Failed to delete old file:", error.message);
    }
  }

  // Return the metadata for the newly uploaded file.
  return newUploadResult;
};

module.exports = {
  uploadFile,
  deleteFile,
  updateFile,
};
