const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    updateUser,
    deleteUser,
    getHotelUsers,
    getAllUsers,
    updateAnyUser,
    deleteAnyUser
} = require('../controllers/authController');
const upload = require('../middleware/upload'); // Multer setup
const { protect, isSuperAdmin } = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions'); // 👈 import middleware

// Routes
// router.post(
//     '/register',
//     hasPermission("user_create"),   // 👈 only users with this permission can create
//     upload.single('profile_image'),
//     registerUser
// );

router.post(
    "/register",
    protect,                      // 👈 pehle login check
    hasPermission("user_create"), // 👈 fir permission check
    upload.single("profile_image"),
    registerUser
);

router.post('/login', loginUser);

router.get(
    '/users',
    protect,
    hasPermission("user_view_any"), // 👈 permission check
    getHotelUsers
);

router.put(
    '/hotel-users/:id',
    protect,
    hasPermission("user_update"),   // 👈 permission check
    upload.single('profile_image'),
    updateUser
);

router.delete(
    '/hotel-users/:id',
    protect,
    hasPermission("user_delete"),   // 👈 permission check
    deleteUser
);

// Superadmin routes (role-based, bypass permissions)
router.get(
    '/all-users',
    protect,
    isSuperAdmin,
    getAllUsers
);

router.put(
    '/superadmin/users/:id',
    protect,
    isSuperAdmin,
    upload.single('profile_image'),
    updateAnyUser
);

router.delete(
    '/superadmin/users/:id',
    protect,
    isSuperAdmin,
    deleteAnyUser
);

module.exports = router;
