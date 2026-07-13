const propertyService = require("../services/property.service");
const { checkFraud } = require("../services/fraud.service");
const fraudQuery = require("../database/queries/fraud.query");
const propertyAmenityQuery = require("../database/queries/property_amenity.query");
const propertyQuery = require("../database/queries/property.query");

const typeMap = {
  'apartment': 'Apartment Building',
  'studio': 'Condominium',
  'commercial': 'Apartment Building',
  'house': 'Townhouse',
  'villa': 'Villa Compound',
};

// POST /properties - create property (landlord only)
const createProperty = async (req, res) => {
  try {
    // 1. Create the property
    const newProperty = await propertyService.createProperty(req.user, {
      ...req.body,
    });

    const propertyData = req.body;
    console.log("New property created:", propertyData);

    // 2. Get amenity names from the request body directly
    let amenityNames = [];
    if (propertyData.amenityIds && propertyData.amenityIds.length > 0) {
      const allAmenities = await propertyAmenityQuery.getAllAmenities();
      amenityNames = allAmenities
        .filter(a => propertyData.amenityIds.includes(a.amenity_id))
        .map(a => a.amenity_name);
    }

    // 3. Run fraud detection for non-commercial properties
    if (propertyData.property_type !== 'commercial') {
      try {
        propertyData.listing_age_days = 0;
        propertyData.views = 0;
        propertyData.contact_clicks = 0;

        const fraudResult = await checkFraud(propertyData, amenityNames);

        if (fraudResult && fraudResult.fraud_probability !== undefined) {
          await fraudQuery.createFraudFlag(
            newProperty.property_id,
            fraudResult.fraud_probability,
            fraudResult.is_fraud ? 'AI detected suspicious patterns' : null
          );

          if (fraudResult.is_fraud) {
            await propertyQuery.updatePropertyStatus(newProperty.property_id, 'flagged');
            console.log(`🚩 Fraud detected! Property #${newProperty.property_id} FLAGGED. Score: ${(fraudResult.fraud_probability * 100).toFixed(1)}%`);
          } else {
            console.log(`✅ Property #${newProperty.property_id} passed. Score: ${(fraudResult.fraud_probability * 100).toFixed(1)}%`);
          }
        } else {
          console.log("⚠️ No valid fraud result returned");
        }
      } catch (fraudErr) {
        console.error("❌ Fraud check failed:", fraudErr.message);
      }
    } else {
      console.log(`🏢 Commercial property #${newProperty.property_id} - fraud check skipped`);
    }

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

const getAllPropertiesMap = async (req, res) => {
  try {
    const properties = await propertyService.getAllPropertiesMap(req.query);

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

// GET / - get homepage properties (public)
const getHomepageProperties = async (req, res) => {
  try {
    const data = await propertyService.getHomepageData();

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error("Homepage Data Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch homepage properties",
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
  getHomepageProperties,
  getAllPropertiesMap,
};