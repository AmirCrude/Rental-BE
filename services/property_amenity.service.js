const propertyAmenityQuery = require("../database/queries/property_amenity.query");
const propertyQuery = require("../database/queries/property.query");

const createPropertyAmenity = async (user, propertyId, amenityId) => {
  const { role, id: landlord_id } = user;

  if (role !== "landlord") {
    throw new Error("Only landlords can add amenities to properties");
  }

  // Verify property ownership
  // const property = await propertyQuery.getPropertyById(propertyId);
  // if (!property || property.landlord_id !== landlord_id) {
  //   throw new Error("Property not found or you are not the owner");
  // }

  const linkedAmenity = await propertyAmenityQuery.createPropertyAmenity(propertyId, amenityId);
  return linkedAmenity;
};

const getAllAmenities = async () => {
  const amenities = await propertyAmenityQuery.getAllAmenities();
  return amenities;
};

const getPropertyAmenities = async (propertyId) => {
  const amenities = await propertyAmenityQuery.getAmenitiesByPropertyId(propertyId);
  return amenities;
};

const updatePropertyAmenities = async (user, propertyId, amenityIds) => {
  const { role, id: landlord_id } = user;

  if (role !== "landlord") {
    throw new Error("Only landlords can update amenities");
  }

  // Verify property ownership
  const property = await propertyQuery.getPropertyById(propertyId);
  if (!property || property.landlord_id !== landlord_id) {
    throw new Error("Property not found or you are not the owner");
  }

  // Get current amenities
  const currentAmenities = await propertyAmenityQuery.getPropertyAmenities(propertyId);
  const currentAmenityIds = currentAmenities.map(a => a.amenity_id);

  // Find amenities to add (new ones not currently selected)
  const amenitiesToAdd = amenityIds.filter(id => !currentAmenityIds.includes(id));

  // Find amenities to remove (currently selected but not in new list)
  const amenitiesToRemove = currentAmenityIds.filter(id => !amenityIds.includes(id));

  // Only delete what needs to be removed
  if (amenitiesToRemove.length > 0) {
    await Promise.all(
      amenitiesToRemove.map(id => 
        propertyAmenityQuery.deletePropertyAmenity(propertyId, id)
      )
    );
  }

  // Only add what's new
  if (amenitiesToAdd.length > 0) {
    await Promise.all(
      amenitiesToAdd.map(id => 
        propertyAmenityQuery.createPropertyAmenity(propertyId, id)
      )
    );
  }

  // Return updated amenities list
  const updatedAmenities = await propertyAmenityQuery.getPropertyAmenities(propertyId);
  return updatedAmenities;
};

const deletePropertyAmenity = async (user, propertyId, amenityId) => {
  const { role, id: landlord_id } = user;

  if (role !== "landlord") {
    throw new Error("Only landlords can remove amenities from properties");
  }

  // Verify property ownership
  const property = await propertyQuery.getPropertyById(propertyId);
  if (!property || property.landlord_id !== landlord_id) {
    throw new Error("Property not found or you are not the owner");
  }

  const success = await propertyAmenityQuery.deletePropertyAmenity(propertyId, amenityId);
  if (!success) {
    throw new Error("Failed to remove amenity or amenity not linked");
  }

  return { message: "Amenity removed successfully" };
};

module.exports = {
  createPropertyAmenity,
  getAllAmenities,
  getPropertyAmenities,
  updatePropertyAmenities,
  deletePropertyAmenity,
};