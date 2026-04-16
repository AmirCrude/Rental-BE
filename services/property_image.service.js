const propertyImageQuery = require("../database/queries/property_image.query");
const propertyQuery = require("../database/queries/property.query");
const cloudinaryImageService = require("./cloudinary.image.service");

const createPropertyImage = async (user, propertyId, file) => {
  const { role, id: landlord_id } = user;

  if (role !== "landlord") {
    throw new Error("Only landlords can upload property images");
  }

  // Verify property ownership
  const property = await propertyQuery.getPropertyById(propertyId);
  if (!property || property.landlord_id !== landlord_id) {
    throw new Error("Property not found or you are not the owner");
  }

  // Upload to Cloudinary
  const uploadResult = await cloudinaryImageService.uploadImage(file);

  // Save to database
  const newImage = await propertyImageQuery.createPropertyImage(
    propertyId,
    uploadResult.url,
    uploadResult.public_id
  );

  return newImage;
};

const getPropertyImages = async (propertyId) => {
  const images = await propertyImageQuery.getImagesByPropertyId(propertyId);
  return images;
};

const deletePropertyImage = async (user, imageId) => {
  const { role, id: landlord_id } = user;

  if (role !== "landlord") {
    throw new Error("Only landlords can delete property images");
  }

  // Verify ownership via the image's property
  const image = await propertyImageQuery.getImageById(imageId);
  if (!image) {
    throw new Error("Image not found");
  }

  const property = await propertyQuery.getPropertyById(image.property_id);
  if (!property || property.landlord_id !== landlord_id) {
    throw new Error("You are not the owner of this property");
  }

  // Delete from Cloudinary
  await cloudinaryImageService.deleteImage(image.public_id);

  // Delete from database
  const success = await propertyImageQuery.deletePropertyImage(imageId);
  if (!success) {
    throw new Error("Failed to delete image");
  }

  return { message: "Image deleted successfully" };
};

module.exports = {
  createPropertyImage,
  getPropertyImages,
  deletePropertyImage,
};