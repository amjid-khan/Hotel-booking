const pool = require('../config/db');
const bcrypt = require('bcrypt');

// -------------------- Create Hotel User --------------------
exports.createHotelUser = async (req, res) => {
    const { full_name, email, phone, password, role, status, hotel_id } = req.body;

    try {
        const adminId = req.user.id;

        // Get the hotel(s) for this admin
        const [hotelRows] = await pool.query(
            "SELECT id FROM hotels WHERE admin_id = ? LIMIT 1",
            [adminId]
        );

        if (hotelRows.length === 0) {
            return res.status(404).json({ message: "No hotel found for this admin" });
        }

        // Use provided hotel_id or default to first hotel
        const selectedHotelId = hotel_id || hotelRows[0].id;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user into hotel_users
        const [result] = await pool.query(
            `INSERT INTO hotel_users 
        (full_name, email, phone, password, role, status, profile_image, hotel_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                full_name,
                email,
                phone || null,
                hashedPassword,
                role || 'user',
                status || 'active',
                req.file ? req.file.filename : null,
                selectedHotelId,
                adminId
            ]
        );

        // Fetch the newly created user to return
        const [newUserRows] = await pool.query(
            "SELECT id, full_name, email, phone, role, status, profile_image, hotel_id FROM hotel_users WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            message: "Hotel user created successfully",
            user: newUserRows[0]  // return the new user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------- Get All Users for Admin's Hotel --------------------
exports.getHotelUsers = async (req, res) => {
    try {
        const adminId = req.user.id;

        // Get hotel for this admin
        const [hotelRows] = await pool.query(
            "SELECT id FROM hotels WHERE admin_id = ? LIMIT 1",
            [adminId]
        );

        if (hotelRows.length === 0) {
            return res.status(404).json({ message: "No hotel found for this admin" });
        }

        const hotelId = hotelRows[0].id;

        // Fetch all users for that hotel
        const [users] = await pool.query(
            "SELECT id, full_name, email, phone, role, status, profile_image FROM hotel_users WHERE hotel_id = ?",
            [hotelId]
        );

        res.status(200).json({
            hotel_id: hotelId,
            users: users || []
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
