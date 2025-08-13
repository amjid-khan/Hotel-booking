const express = require('express');
const router = express.Router();

const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
    addRoom,
    getAllRooms,
    updateRoom,
    deleteRoom,
} = require('../controllers/adminController');

router.post('/rooms', authenticateToken, authorizeRoles('admin', 'superadmin'), addRoom);
router.get('/rooms', authenticateToken, authorizeRoles('admin', 'superadmin'), getAllRooms);
router.put('/rooms/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), updateRoom);
router.delete('/rooms/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), deleteRoom);

module.exports = router;
