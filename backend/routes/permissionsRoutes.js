'use strict';

const express = require('express');
const router = express.Router();
const { getAllPermissions } = require('../controllers/permissions.controller');
const { protect } = require('../middleware/auth');

// GET /api/permissions - get all permissions
router.get('/', protect, getAllPermissions);  // http://localhost:5000/api/permissions

module.exports = router;
