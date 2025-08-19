const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getAllUsers, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // only if you have this

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser); // or add protect if available

module.exports = router;