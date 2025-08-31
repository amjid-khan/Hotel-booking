const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
    createHotel,
    getAdminHotels,
    checkHotel,
    updateHotel,
    deleteHotel,
    getHotelById,
    getPublicHotels
} = require('../controllers/hotelController');

// Create a new hotel
router.post('/create', protect, isAdmin, createHotel);

// Get all hotels of logged-in admin
router.get('/my-hotels', protect, isAdmin, getAdminHotels);

// Check if admin has at least one hotel
router.get('/check', protect, isAdmin, checkHotel);

// GET single hotel by ID  <-- add this
router.get('/:id', protect, isAdmin, getHotelById);

// Update a hotel by ID
router.put('/:id', protect, isAdmin, updateHotel);

router.get('/admin/:id', protect, isAdmin, getHotelById);

// Delete a hotel by ID
router.delete('/:id', protect, isAdmin, deleteHotel);

router.get('/public/all', getPublicHotels);   //http://localhost:5000/api/hotels/public/all

module.exports = router;
