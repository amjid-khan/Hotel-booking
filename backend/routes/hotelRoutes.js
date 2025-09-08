const express = require('express');
const router = express.Router();
const { verifyToken } = require("../utils/generateToken")
const { protect, isAdmin, isSuperAdmin } = require('../middleware/auth');
const {
    createHotel,
    getAdminHotels,
    checkHotel,
    updateHotel,
    deleteHotel,
    getHotelById,
    getAllHotelsSuperAdmin,
    getRoleHotelDashboard
} = require('../controllers/hotelController');

// ==================== ADMIN ROUTES ====================
// Create a new hotel (Admin only)
router.post('/create', protect, isAdmin, createHotel);

// Get all hotels of logged-in admin
router.get('/my-hotels', protect, isAdmin, getAdminHotels);

// Check if admin has at least one hotel
router.get('/check', protect, isAdmin, checkHotel);

// GET single hotel by ID (Admin - only their own hotel)
router.get('/:id', protect, isAdmin, getHotelById);

// Alternative route for admin to get hotel by ID
router.get('/admin/:id', protect, isAdmin, getHotelById);

// Update a hotel by ID (Admin - only their own hotel)
router.put('/:id', protect, isAdmin, updateHotel);

// Delete a hotel by ID (Admin - only their own hotel)
router.delete('/:id', protect, isAdmin, deleteHotel);

// ==================== SUPER ADMIN ROUTES ====================
// Get all hotels (SuperAdmin only)
router.get('/superadmin/all', protect, isSuperAdmin, getAllHotelsSuperAdmin);

// Get any hotel by ID (SuperAdmin can access any hotel)
router.get('/superadmin/hotel/:id', protect, isSuperAdmin, getHotelById);

// Update any hotel by ID (SuperAdmin can update any hotel)
router.put('/superadmin/hotel/:id', protect, isSuperAdmin, updateHotel);

// Delete any hotel by ID (SuperAdmin can delete any hotel)
router.delete('/superadmin/hotel/:id', protect, isSuperAdmin, deleteHotel);


// ==================== ROLE USER ROUTES ====================
// Get assigned hotel dashboard for role users (receptionist, manager, etc.)
router.get('/dashboard', protect, getRoleHotelDashboard);


module.exports = router;