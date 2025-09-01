const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getHotelUsers,
    getAllUsers,
    updateAnyUser,
    deleteAnyUser
} = require('../controllers/authController');
const upload = require('../middleware/upload'); // Multer setup
const { protect, isSuperAdmin } = require('../middleware/auth');

// Routes
router.post('/register', upload.single('profile_image'), registerUser);
router.post('/login', loginUser);
router.get('/users', getHotelUsers); // fetch users by hotelId
router.put('/hotel-users/:id', upload.single('profile_image'), updateUser);
router.delete('/hotel-users/:id', deleteUser);

// Superadmin routes
router.get('/all-users', protect, isSuperAdmin, getAllUsers);           // http://localhost:5000/api/auth/all-users
router.put('/superadmin/users/:id', protect, isSuperAdmin, upload.single('profile_image'), updateAnyUser);  // http://localhost:5000/api/auth/superadmin/users/:id
router.delete('/superadmin/users/:id', protect, isSuperAdmin, deleteAnyUser);  // http://localhost:5000/api/auth/superadmin/users/:id

module.exports = router;