const express = require("express");
const router = express.Router();
const { protect, isSuperAdmin, isAdminOrSuperAdmin } = require("../middleware/auth");
const { createRole, getRoles } = require("../controllers/roleController");

// ✅ Super Admin only
router.post("/super-only", protect, isSuperAdmin, createRole);

// ✅ Admin + Super Admin dono ke liye
router.post("/", protect, isAdminOrSuperAdmin, createRole);

// ✅ Get all roles with permissions (Admin + Super Admin dono dekh sakte hain)
router.get("/", protect, isAdminOrSuperAdmin, getRoles);

module.exports = router;
