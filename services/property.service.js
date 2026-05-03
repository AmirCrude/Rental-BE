const propertyQuery = require("../database/queries/property.query");

const createProperty = async (user, propertyData) => {
  const { role, id: landlord_id } = user;

  if (role !== "landlord") {
    throw new Error("Only landlords can create property listings");
  }

  const newPropertyData = {
    ...propertyData,
    landlord_id,
    status: "active",
  };

  const newProperty = await propertyQuery.createProperty(newPropertyData);
  return newProperty;
};

const getAllProperties = async (filters = {}) => {
  const properties = await propertyQuery.getAllProperties(filters);
  return properties;
};

// services/propertyService.js
const getHomepageData = async () => {
  // Fetch everything in parallel to minimize wait time
  const [featured, latest, locations] = await Promise.all([
    propertyQuery.getPropertiesByCriteria({ featured: true, limit: 6 }),
    propertyQuery.getPropertiesByCriteria({ featured: false, limit: 3 }),
    propertyQuery.getUniqueLocations()
  ]);

  return {
    featuredTop: featured.slice(0, 3),    // First 3 featured
    latest: latest,                       // 3 Latest
    featuredBottom: featured.slice(3, 6),  // Remaining 3 featured
    locations: locations.map(l => l.city)
  };
};

const getPropertyById = async (id) => {
  console.log("Fetching property with ID:", id);
  const property = await propertyQuery.getPropertyById(id);
  if (!property) {
    throw new Error("Property not found");
  }
  return property;
};

const getMyProperties = async (user) => {
  const { role, id: landlord_id } = user;

  if (role !== "landlord") {
    throw new Error("Only landlords can view their properties");
  }

  const properties = await propertyQuery.getPropertiesByLandlordId(landlord_id);
  return properties;
};

const updateProperty = async (user, id, propertyData) => {
  const { role, id: landlord_id } = user;

  if (role !== "landlord") {
    throw new Error("Only landlords can update properties");
  }

  const existing = await propertyQuery.getPropertyById(id);
  if (!existing || existing.landlord_id !== landlord_id) {
    throw new Error("Property not found or you are not the owner");
  }

  const updatedProperty = await propertyQuery.updateProperty(id, propertyData);
  return updatedProperty;
};

const deleteProperty = async (user, id) => {
  const { role, id: landlord_id } = user;

  if (role !== "landlord") {
    throw new Error("Only landlords can delete properties");
  }

  const existing = await propertyQuery.getPropertyById(id);
  if (!existing || existing.landlord_id !== landlord_id) {
    throw new Error("Property not found or you are not the owner");
  }

  const success = await propertyQuery.deleteProperty(id);
  if (!success) {
    throw new Error("Failed to delete property");
  }
  return { message: "Property deleted successfully" };
};

module.exports = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
  getHomepageData,
};