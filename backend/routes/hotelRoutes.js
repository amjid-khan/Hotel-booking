const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const {
    createHotel,
    getAdminHotels,
    checkHotel,
    updateHotel,
    deleteHotel
} = require('../controllers/hotelController');

// Create a new hotel
router.post('/create', protect, isAdmin, createHotel);

// Get all hotels of logged-in admin
router.get('/my-hotels', protect, isAdmin, getAdminHotels);

// Check if admin has at least one hotel
router.get('/check', protect, isAdmin, checkHotel);

// Update a hotel by ID
router.put('/:id', protect, isAdmin, updateHotel);

// Delete a hotel by ID
router.delete('/:id', protect, isAdmin, deleteHotel);

module.exports = router;
