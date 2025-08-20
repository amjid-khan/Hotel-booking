const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // only if you have this

router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;