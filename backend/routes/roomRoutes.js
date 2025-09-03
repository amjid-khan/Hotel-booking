const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
    addRoom,
    getAllRooms,
    updateRoom,
    deleteRoom,
    getUserRooms
} = require('../controllers/roomControllers'); // Ensure correct file path

// Add new room (with image upload)
router.post(
    '/',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    upload.single('image'),   // Handle image upload
    addRoom
);

// Get all rooms (optionally filter by hotelId)
router.get(
    '/',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    getAllRooms
);

// Update room (with image upload)
router.put(
    '/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    upload.single('image'),   // Handle image upload
    updateRoom
);

// Delete room
router.delete(
    '/:id',
    authenticateToken,
    authorizeRoles('admin', 'superadmin'),
    deleteRoom
);

router.get('/user', authenticateToken, authorizeRoles('user'), getUserRooms); // http://localhost:5000/api/rooms/user


module.exports = router;
