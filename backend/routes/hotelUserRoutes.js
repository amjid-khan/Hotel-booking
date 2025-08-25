const express = require("express");
const router = express.Router();
const {
    createHotelUser,
    getHotelUsers,
    updateHotelUser,
    deleteHotelUser
} = require("../controllers/hotelUserController");
const { protect, isAdmin } = require("../middleware/auth.js");
const upload = require("../middleware/upload.js");

// POST /api/hotel-users (Create hotel user)
router.post("/", protect, isAdmin, upload.single("profile_image"), createHotelUser);

// GET /api/hotel-users (Fetch hotel users for logged-in admin)
router.get("/", protect, isAdmin, getHotelUsers);

// PUT /api/hotel-users/:id (Update hotel user)
router.put("/:id", protect, isAdmin, upload.single("profile_image"), updateHotelUser);

// DELETE /api/hotel-users/:id (Delete hotel user)
router.delete("/:id", protect, isAdmin, deleteHotelUser);

module.exports = router;
