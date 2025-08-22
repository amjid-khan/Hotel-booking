const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Create hotel user
exports.createHotelUser = async (req, res) => {
    const { full_name, email, phone, password, role, status, hotel_id } = req.body;

    try {
        // Check if hotel exists for given admin (from token or localStorage)
        // Assuming req.user.id is the admin ID from JWT middleware
        const adminId = req.user.id;

        const [hotelRows] = await pool.query(
            "SELECT id FROM hotels WHERE admin_id = ? LIMIT 1",
            [adminId]
        );

        if (hotelRows.length === 0) {
            return res.status(404).json({ message: "No hotel found for this admin" });
        }

        // Either use provided hotel_id (if you allow choosing manually) 
        // or the first one for that admin:
        const selectedHotelId = hotel_id || hotelRows[0].id;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into hotel_users
        await pool.query(
            `INSERT INTO hotel_users 
        (full_name, email, phone, password, role, status, profile_image, hotel_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                full_name,
                email,
                phone || null,
                hashedPassword,
                role,
                status,
                req.file ? req.file.filename : null,
                selectedHotelId,
                adminId
            ]
        );

        res.status(201).json({ message: "Hotel user created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
