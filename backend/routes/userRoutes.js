const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    deleteUser,
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// User profile routes
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);

// Admin/Superadmin routes
router.get('/', authenticateToken, authorizeRoles('admin', 'superadmin'), getAllUsers);
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'superadmin'), deleteUser);

module.exports = router;
