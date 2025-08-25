const pool = require('../config/db');
const bcrypt = require('bcrypt');

// -------------------- Create Hotel User --------------------
exports.createHotelUser = async (req, res) => {
    const { full_name, email, phone, password, role, status, hotel_id } = req.body;

    try {
        const adminId = req.user.id;

        const [hotelRows] = await pool.query(
            "SELECT id FROM hotels WHERE admin_id = ? LIMIT 1",
            [adminId]
        );

        if (hotelRows.length === 0) {
            return res.status(404).json({ message: "No hotel found for this admin" });
        }

        const selectedHotelId = hotel_id || hotelRows[0].id;
        const hashedPassword = await bcrypt.hash(password, 10);

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

        const [newUserRows] = await pool.query(
            "SELECT id, full_name, email, phone, role, status, profile_image, hotel_id FROM hotel_users WHERE id = ?",
            [result.insertId]
        );

        res.status(201).json({
            message: "Hotel user created successfully",
            user: newUserRows[0]
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

        const [hotelRows] = await pool.query(
            "SELECT id FROM hotels WHERE admin_id = ? LIMIT 1",
            [adminId]
        );

        if (hotelRows.length === 0) {
            return res.status(404).json({ message: "No hotel found for this admin" });
        }

        const hotelId = hotelRows[0].id;

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

// -------------------- Update Hotel User --------------------
exports.updateHotelUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, phone, password, role, status } = req.body;

    try {
        const adminId = req.user.id;

        // Check if user exists and belongs to admin's hotel
        const [userRows] = await pool.query(
            `SELECT hu.id FROM hotel_users hu
             JOIN hotels h ON hu.hotel_id = h.id
             WHERE hu.id = ? AND h.admin_id = ?`,
            [id, adminId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: "User not found or not authorized" });
        }

        let hashedPassword = undefined;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        await pool.query(
            `UPDATE hotel_users SET 
                full_name = COALESCE(?, full_name),
                email = COALESCE(?, email),
                phone = COALESCE(?, phone),
                password = COALESCE(?, password),
                role = COALESCE(?, role),
                status = COALESCE(?, status),
                profile_image = COALESCE(?, profile_image)
             WHERE id = ?`,
            [
                full_name,
                email,
                phone,
                hashedPassword,
                role,
                status,
                req.file ? req.file.filename : undefined,
                id
            ]
        );

        const [updatedUser] = await pool.query(
            "SELECT id, full_name, email, phone, role, status, profile_image, hotel_id FROM hotel_users WHERE id = ?",
            [id]
        );

        res.status(200).json({
            message: "Hotel user updated successfully",
            user: updatedUser[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// -------------------- Delete Hotel User --------------------
exports.deleteHotelUser = async (req, res) => {
    const { id } = req.params;

    try {
        const adminId = req.user.id;

        // Ensure user belongs to admin's hotel
        const [userRows] = await pool.query(
            `SELECT hu.id FROM hotel_users hu
             JOIN hotels h ON hu.hotel_id = h.id
             WHERE hu.id = ? AND h.admin_id = ?`,
            [id, adminId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ message: "User not found or not authorized" });
        }

        await pool.query("DELETE FROM hotel_users WHERE id = ?", [id]);

        res.status(200).json({ message: "Hotel user deleted successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
