const propertyAmenityService = require("../services/property_amenity.service");

// GET /properties/amenities - list all available amenities (public)
const getAllAmenities = async (req, res) => {
  try {
    const amenities = await propertyAmenityService.getAllAmenities();

    return res.status(200).json({
      success: true,
      data: amenities,
    });
  } catch (error) {
    console.error("Get All Amenities Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch amenities",
    });
  }
};

// GET /properties/:propertyId/amenities - get amenities linked to a property (public)
const getPropertyAmenities = async (req, res) => {
  try {
    const amenities = await propertyAmenityService.getPropertyAmenities(req.params.propertyId);

    return res.status(200).json({
      success: true,
      data: amenities,
    });
  } catch (error) {
    console.error("Get Property Amenities Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch property amenities",
    });
  }
};

// POST /properties/:propertyId/amenities - add amenity to property (landlord only)
const createPropertyAmenity = async (req, res) => {
  try {
    const { amenityIds } = req.body; // Matches frontend { amenityIds: [...] }
    const { propertyId } = req.params;

    // Loop through each ID and call the service
    const results = await Promise.all(
      amenityIds.map(id => 
        propertyAmenityService.createPropertyAmenity(req.user, propertyId, id)
      )
    );

    return res.status(201).json({
      success: true,
      message: "Amenities added successfully",
      data: results,
    });
  } catch (error) {
    console.error("Property Amenity Creation Error:", error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /properties/:propertyId/amenities - update all amenities for a property
const updatePropertyAmenities = async (req, res) => {
  try {
    const { amenityIds } = req.body; // Array of amenity IDs to set
    const { propertyId } = req.params;

    const result = await propertyAmenityService.updatePropertyAmenities(
      req.user,
      propertyId,
      amenityIds
    );

    return res.status(200).json({
      success: true,
      message: "Amenities updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Property Amenities Update Error:", error);
    return res.status(400).json({ 
      success: false, 
      message: error.message || "Failed to update amenities" 
    });
  }
};


// DELETE /properties/:propertyId/amenities/:amenityId - remove amenity (landlord only)
const deletePropertyAmenity = async (req, res) => {
  try {
    const result = await propertyAmenityService.deletePropertyAmenity(
      req.user,
      req.params.propertyId,
      req.params.amenityId
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Property Amenity Delete Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to remove amenity",
    });
  }
};

module.exports = {
  getAllAmenities,
  getPropertyAmenities,
  createPropertyAmenity,
  updatePropertyAmenities,
  deletePropertyAmenity,
};