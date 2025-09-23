// routes/analyticsRoutes.js
const express = require("express");
const router = express.Router();
const { getRevenue, getMonthlyRevenue, getOccupancy } = require("../controllers/analyticsController");
const { protect, isSuperAdmin } = require("../middleware/auth");

// 🔹 Super Admin ke liye analytics (all hotels ka data)
router.get("/revenue", protect, isSuperAdmin, getRevenue);  // http://localhost:5000/api/analytics/revenue
router.get("/revenue/monthly", protect, isSuperAdmin, getMonthlyRevenue);
router.get("/occupancy", protect, isSuperAdmin, getOccupancy);

module.exports = router;
