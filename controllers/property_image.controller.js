const propertyImageService = require("../services/property_image.service");

// POST /properties/:propertyId/images - upload image (landlord only)
const createPropertyImage = async (req, res) => {
  try {
    const newImage = await propertyImageService.createPropertyImage(
      req.user,
      req.params.propertyId,
      req.file
    );

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: newImage,
    });
  } catch (error) {
    console.error("Property Image Upload Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Image upload failed",
    });
  }
};

// GET /properties/:propertyId/images - get all images for a property (public)
const getPropertyImages = async (req, res) => {
  try {
    const images = await propertyImageService.getPropertyImages(req.params.propertyId);

    return res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Get Property Images Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch images",
    });
  }
};

// DELETE /properties/:propertyId/images/:imageId - delete image (landlord only)
const deletePropertyImage = async (req, res) => {
  try {
    const result = await propertyImageService.deletePropertyImage(
      req.user,
      req.params.imageId
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Property Image Delete Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Image deletion failed",
    });
  }
};

module.exports = {
  createPropertyImage,
  getPropertyImages,
  deletePropertyImage,
};