const express = require("express");
const router = express.Router();
const { protect, isSuperAdmin, isAdminOrSuperAdmin } = require("../middleware/auth");
const { hasPermission } = require("../middleware/permissions"); // 👈 import
const { createRole, getRoles } = require("../controllers/roleController");

// ✅ Super Admin only route
router.post(
    "/super-only",
    protect,
    isSuperAdmin,
    hasPermission("role_create"),  // 👈 permission check
    createRole
);

// ✅ Admin + Super Admin dono ke liye
router.post(
    "/",
    protect,
    isAdminOrSuperAdmin,
    hasPermission("role_create"),  // 👈 permission check
    createRole
);

// ✅ Get all roles with permissions (Admin + Super Admin dono dekh sakte hain)
router.get(
    "/",
    protect,
    isAdminOrSuperAdmin,
    hasPermission("role_view_any"), // 👈 permission check
    getRoles
);

module.exports = router;
