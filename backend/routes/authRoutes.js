const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUser, deleteUser, getHotelUsers, getAllUsers } = require('../controllers/authController');
const upload = require('../middleware/upload'); // Multer setup
const { protect, isSuperAdmin } = require('../middleware/auth'); // ADD THIS LINE

// Routes
router.post('/register', upload.single('profile_image'), registerUser);
router.post('/login', loginUser);
router.get('/users', getHotelUsers); // fetch users by hotelId
router.put('/hotel-users/:id', upload.single('profile_image'), updateUser);
router.delete('/hotel-users/:id', deleteUser);

// Superadmin route — fetch all users
router.get('/all-users', protect, isSuperAdmin, getAllUsers);   //http://localhost:5000/api/auth/all-users

module.exports = router;
