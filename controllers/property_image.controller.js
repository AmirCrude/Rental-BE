

// POST /properties/:propertyId/images - upload image (landlord only)
const propertyImageService = require("../services/property_image.service.js");

const createPropertyImage = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const files = req.files || []; // Physical files from Multer
    let { imageUrls } = req.body;  // URL strings from FormData

    // Ensure imageUrls is an array
    if (!imageUrls) imageUrls = [];
    if (typeof imageUrls === "string") imageUrls = [imageUrls];

    const results = [];

    // 1. Process physical files (Upload to Cloudinary)
    for (const file of files) {
      const newImg = await propertyImageService.createPropertyImage(req.user, propertyId, file);
      results.push(newImg);
    }

    // 2. Process existing URLs
    for (const url of imageUrls) {
      const newImg = await propertyImageService.saveImageByUrl(req.user, propertyId, url);
      results.push(newImg);
    }

    return res.status(201).json({
      success: true,
      message: "Images processed successfully",
      data: results,
    });
  } catch (error) {
    console.error("Property Image Upload Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Image processing failed",
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