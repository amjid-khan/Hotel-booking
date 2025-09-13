'use strict';

const express = require('express');
const router = express.Router();
const { getAllPermissions } = require('../controllers/permissions.controller');

// GET /api/permissions - get all permissions
router.get('/', getAllPermissions);  // http://localhost:5000/api/permissions

module.exports = router;
