const express = require('express');
const router = express.Router();

const {
    bookRoom,
    getUserBookings,
    cancelBooking,
} = require('../controllers/bookingController');

const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, authorizeRoles('user', 'admin', 'superadmin'), bookRoom);
router.get('/', authenticateToken, authorizeRoles('user', 'admin', 'superadmin'), getUserBookings);
router.delete('/:id', authenticateToken, authorizeRoles('user', 'admin', 'superadmin'), cancelBooking);

module.exports = router;
