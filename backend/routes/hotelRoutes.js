const express = require('express');
const router = express.Router();
const { protect, isSuperAdmin } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');
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
router.post(
    '/create',
    protect,
    hasPermission("hotel_create"),   // 👈 permission check
    createHotel
);

// Get all hotels of logged-in admin
router.get(
    '/my-hotels',
    protect,
    hasPermission("hotel_view_any"), // 👈 permission check
    getAdminHotels
);

// Check if admin has at least one hotel
router.get(
    '/check',
    protect,
    hasPermission("hotel_view_self"), // 👈 self-check permission
    checkHotel
);

// GET single hotel by ID (Admin - only their own hotel)
router.get(
    '/:id',
    protect,
    hasPermission(["hotel_view_self", "hotel_view_any"]), // 👈 either of these works
    getHotelById
);

// Alternative route for admin to get hotel by ID
router.get(
    '/admin/:id',
    protect,
    hasPermission(["hotel_view_self", "hotel_view_any"]),
    getHotelById
);

// Update a hotel by ID (Admin - only their own hotel)
router.put(
    '/:id',
    protect,
    hasPermission("hotel_update"),
    updateHotel
);

// Delete a hotel by ID (Admin - only their own hotel)
router.delete(
    '/:id',
    protect,
    hasPermission("hotel_delete"),
    deleteHotel
);

// ==================== SUPER ADMIN ROUTES ====================
// Get all hotels (SuperAdmin only)
router.get(
    '/superadmin/all',
    protect,
    isSuperAdmin,   // 👈 superadmin bypasses permission
    getAllHotelsSuperAdmin
);

// Get any hotel by ID (SuperAdmin can access any hotel)
router.get(
    '/superadmin/hotel/:id',
    protect,
    isSuperAdmin,
    getHotelById
);

// Update any hotel by ID (SuperAdmin can update any hotel)
router.put(
    '/superadmin/hotel/:id',
    protect,
    isSuperAdmin,
    updateHotel
);

// Delete any hotel by ID (SuperAdmin can delete any hotel)
router.delete(
    '/superadmin/hotel/:id',
    protect,
    isSuperAdmin,
    deleteHotel
);

// ==================== ROLE USER ROUTES ====================
// Get assigned hotel dashboard for role users (receptionist, manager, etc.)
router.get(
    '/dashboard',
    protect,
    hasPermission("hotel_dashboard_view"), // 👈 receptionist, manager, etc.
    getRoleHotelDashboard
);

module.exports = router;
