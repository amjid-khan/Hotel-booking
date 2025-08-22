const express = require("express");
const router = express.Router();
const { createHotelUser } = require("../controllers/hotelUserController");
const { protect, isAdmin } = require("../middleware/auth.js")
const upload = require("../middleware/upload.js")

// POST /api/hotel-users
router.post("/", protect, isAdmin, upload.single("profile_image"), createHotelUser);

module.exports = router;
