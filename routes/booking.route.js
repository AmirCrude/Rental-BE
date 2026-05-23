const express = require("express");
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  cancelBooking,
  approveBooking,
  rejectBooking,
} = require("../controllers/booking.controller");

const { authMiddleware } = require("../middlewares/auth/auth.middleware");

// All booking routes require authentication
router.use(authMiddleware);

// Tenant routes
router.post("/:propertyId", createBooking);           // POST /api/bookings/:propertyId
router.get("/my", getMyBookings);                      // GET /api/bookings/my
router.put("/:bookingId/cancel", cancelBooking);       // PUT /api/bookings/:bookingId/cancel

// Landlord routes
router.put("/:bookingId/approve", approveBooking);     // PUT /api/bookings/:bookingId/approve
router.put("/:bookingId/reject", rejectBooking);       // PUT /api/bookings/:bookingId/reject

module.exports = router;