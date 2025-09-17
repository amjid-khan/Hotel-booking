const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { hasPermission } = require('../middleware/permissions'); // 👈 add this

const {
    addRoom,
    getAllRooms,
    updateRoom,
    deleteRoom,
    getUserRooms
} = require('../controllers/roomControllers');

// Add new room (permission: room_create)
router.post(
    '/',
    authenticateToken,
    hasPermission("room_create"),   // 👈 check permission
    upload.single('image'),
    addRoom
);

// Get all rooms (permission: room_view_any)
router.get(
    '/',
    authenticateToken,
    hasPermission("room_view_any"), // 👈 check permission
    getAllRooms
);

// Update room (permission: room_update)
router.put(
    '/:id',
    authenticateToken,
    hasPermission("room_update"),   // 👈 check permission
    upload.single('image'),
    updateRoom
);

// Delete room (permission: room_delete)
router.delete(
    '/:id',
    authenticateToken,
    hasPermission("room_delete"),   // 👈 check permission
    deleteRoom
);

// Get rooms for the logged-in user (permission: room_view_self)
router.get(
    '/user',
    authenticateToken,
    hasPermission("room_view_self"), // 👈 check permission
    getUserRooms
);

module.exports = router;
