const bookingQuery = require("../database/queries/booking.query");
const propertyQuery = require("../database/queries/property.query");

const createBooking = async (user, propertyId) => {
    const { role, id: tenantId } = user;
  
    if (role !== "tenant") {
      throw new Error("Only tenants can book properties");
    }
  
    const property = await propertyQuery.getPropertyById(propertyId);
    if (!property) {
      throw new Error("Property not found");
    }
    if (property.availability_status !== "available") {
      throw new Error("Property is not available for booking");
    }
  
    // Check for ANY existing booking (pending, approved, rejected)
    const [existing] = await bookingQuery.getExistingBooking(tenantId, propertyId);
    if (existing) {
      if (existing.status === 'pending') {
        throw new Error("You already have a pending request for this property");
      } else if (existing.status === 'approved') {
        throw new Error("You already have an approved booking for this property");
      } else if (existing.status === 'rejected') {
        throw new Error("Your previous request for this property was rejected");
      }
    }
  
    return await bookingQuery.createBooking({
      property_id: propertyId,
      tenant_id: tenantId,
    });
  };

const getMyBookings = async (user) => {
  const { role, id } = user;

  if (role === "tenant") {
    return await bookingQuery.getTenantBookings(id);
  } else if (role === "landlord") {
    return await bookingQuery.getLandlordBookings(id);
  } else {
    throw new Error("Unauthorized");
  }
};

const cancelBooking = async (user, bookingId) => {
  const booking = await bookingQuery.getBookingById(bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }

  // Only the tenant who made the booking can cancel
  if (booking.tenant_id !== user.id) {
    throw new Error("You can only cancel your own bookings");
  }

  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be cancelled");
  }

  return await bookingQuery.updateBookingStatus(bookingId, "cancelled");
};

const approveBooking = async (user, bookingId) => {
  const booking = await bookingQuery.getBookingById(bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }

  // Verify landlord owns the property
  const property = await propertyQuery.getPropertyById(booking.property_id);
  if (!property || property.landlord_id !== user.id) {
    throw new Error("You are not the owner of this property");
  }

  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be approved");
  }

  // Approve booking
  const updated = await bookingQuery.updateBookingStatus(bookingId, "approved");

  // Mark property as rented
  await propertyQuery.updatePropertyStatus(booking.property_id, "rented");

  return updated;
};

const rejectBooking = async (user, bookingId) => {
  const booking = await bookingQuery.getBookingById(bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }

  // Verify landlord owns the property
  const property = await propertyQuery.getPropertyById(booking.property_id);
  if (!property || property.landlord_id !== user.id) {
    throw new Error("You are not the owner of this property");
  }

  if (booking.status !== "pending") {
    throw new Error("Only pending bookings can be rejected");
  }

  return await bookingQuery.updateBookingStatus(bookingId, "rejected");
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
};