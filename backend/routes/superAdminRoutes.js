const express = require('express');
const router = express.Router();

// const superAdminController = require('../controllers/superAdminController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(authenticateToken);
router.use(authorizeRoles('superadmin'));

// router.get('/reports/monthly-bookings', superAdminController.getMonthlyBookingReport);

module.exports = router;
