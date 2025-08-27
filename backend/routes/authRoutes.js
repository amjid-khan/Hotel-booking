const express = require('express');
const router = express.Router();
const { registerUser, loginUser, updateUser, deleteUser, getHotelUsers } = require('../controllers/authController');
const upload = require('../middleware/upload'); // Multer setup

router.post('/register', upload.single('profile_image'), registerUser);
router.post('/login', loginUser);
router.get('/users', getHotelUsers); // fetch users by hotelId
router.put('/hotel-users/:id', upload.single('profile_image'), updateUser);
router.delete('/hotel-users/:id', deleteUser);

module.exports = router;
