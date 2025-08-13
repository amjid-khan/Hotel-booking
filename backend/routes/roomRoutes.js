const express = require('express');
const router = express.Router();
const { addRoom, getRooms } = require('../controllers/roomController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// Only admin & superadmin can add room
router.post('/', authenticateToken, authorizeRoles('admin', 'superadmin'), addRoom);

// All authenticated users can get rooms list
router.get('/', authenticateToken, getRooms);

module.exports = router;
