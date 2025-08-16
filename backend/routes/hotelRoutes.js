// routes/hotelRoutes.js
const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { createHotel, getAdminHotels, checkHotel, updateHotel, deleteHotel } = require('../controllers/hotelController');

router.post('/create', protect, isAdmin, createHotel);
router.get('/my-hotels', protect, isAdmin, getAdminHotels);
router.get('/check', protect, isAdmin, checkHotel);
router.put('/:id', protect, isAdmin, updateHotel);
router.delete('/:id', protect, isAdmin, deleteHotel);

module.exports = router;
