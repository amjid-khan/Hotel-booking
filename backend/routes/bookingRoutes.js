const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
// Create booking
router.post('/', bookingController.createBooking);

// Get bookings for a hotel
router.get('/hotel/:hotelId', bookingController.getHotelBookings);

// Cancel booking (optional)
router.put('/cancel/:bookingId', bookingController.cancelBooking);

router.get('/my', protect, bookingController.getMyBookings);
// Delete booking
router.delete('/:bookingId', bookingController.deleteBooking);

// Admin update booking status
router.put('/status/:bookingId', bookingController.updateStatus);




module.exports = router;
