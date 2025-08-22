const express = require("express");
const router = express.Router();
const { createHotelUser, getHotelUsers } = require("../controllers/hotelUserController");
const { protect, isAdmin } = require("../middleware/auth.js");
const upload = require("../middleware/upload.js");

// POST /api/hotel-users (Create hotel user)
router.post("/", protect, isAdmin, upload.single("profile_image"), createHotelUser);

// GET /api/hotel-users (Fetch hotel users for logged-in admin)
router.get("/", protect, isAdmin, getHotelUsers);

module.exports = router;
