const propertyService = require("../services/property.service");

// POST /properties - create property (landlord only)
const createProperty = async (req, res) => {
  try {
    const newProperty = await propertyService.createProperty(req.user, {
      ...req.body,
    });

    return res.status(201).json({
      success: true,
      message: "Property created successfully",
      data: newProperty,
    });
  } catch (error) {
    console.error("Property Creation Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Property creation failed",
    });
  }
};

// GET /properties - get all active properties (public)
const getAllProperties = async (req, res) => {
  try {
    const properties = await propertyService.getAllProperties(req.query);

    return res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error("Get Properties Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch properties",
    });
  }
};

// GET /properties/:id - get single property (public)
const getPropertyById = async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);

    return res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Get Property Error:", error);

    return res.status(404).json({
      success: false,
      message: error.message || "Property not found",
    });
  }
};

// GET /properties/my - get landlord's own properties
const getMyProperties = async (req, res) => {
  try {
    const properties = await propertyService.getMyProperties(req.user);

    return res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    console.error("Get My Properties Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch your properties",
    });
  }
};

// PUT /properties/:id - update property (landlord only)
const updateProperty = async (req, res) => {
  try {
    const updatedProperty = await propertyService.updateProperty(
      req.user,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Property updated successfully",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Property Update Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Property update failed",
    });
  }
};

// DELETE /properties/:id - delete property (landlord only)
const deleteProperty = async (req, res) => {
  try {
    const result = await propertyService.deleteProperty(req.user, req.params.id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Property Delete Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Property deletion failed",
    });
  }
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
};