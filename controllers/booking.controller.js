const bookingService = require("../services/booking.service");

const createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking(req.user, req.params.propertyId);
    return res.status(201).json({
      success: true,
      message: "Booking request sent successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Booking Creation Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Booking creation failed",
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user);
    return res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get Bookings Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch bookings",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingService.cancelBooking(req.user, req.params.bookingId);
    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel booking",
    });
  }
};

const approveBooking = async (req, res) => {
  try {
    const booking = await bookingService.approveBooking(req.user, req.params.bookingId);
    return res.status(200).json({
      success: true,
      message: "Booking approved successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Approve Booking Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to approve booking",
    });
  }
};

const rejectBooking = async (req, res) => {
  try {
    const booking = await bookingService.rejectBooking(req.user, req.params.bookingId);
    return res.status(200).json({
      success: true,
      message: "Booking rejected",
      data: booking,
    });
  } catch (error) {
    console.error("Reject Booking Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to reject booking",
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
};