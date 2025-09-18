const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Create booking
router.post('/', bookingController.createBooking);

// Get bookings for a hotel
router.get('/hotel/:hotelId', bookingController.getHotelBookings);

// Cancel booking (optional)
router.put('/cancel/:bookingId', bookingController.cancelBooking);

module.exports = router;
