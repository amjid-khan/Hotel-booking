const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');

// ==================== BOOKING ROUTES ====================

// Create booking (Customer / Role user)
router.post(
    '/',
    protect,
    hasPermission("booking_create"),
    bookingController.createBooking
);

// Get bookings for a hotel (Admin / Manager)
router.get(
    '/hotel/:hotelId',
    protect,
    hasPermission("booking_view_any"),  // 👈 Admin/Manager
    bookingController.getHotelBookings
);

// Cancel booking (Customer / Role user)
router.put(
    '/cancel/:bookingId',
    protect,
    hasPermission("booking_cancel"),
    bookingController.cancelBooking
);

// Get my own bookings (Customer)
router.get(
    '/my',
    protect,
    hasPermission("booking_view_self"),  // 👈 only their own bookings
    bookingController.getMyBookings
);

// Delete booking (Admin / Manager)
router.delete(
    '/:bookingId',
    protect,
    hasPermission("booking_delete"),
    bookingController.deleteBooking
);

// Admin update booking status (Admin / Manager)
router.put(
    '/status/:bookingId',
    protect,
    hasPermission("booking_update"),
    bookingController.updateStatus
);

module.exports = router;
