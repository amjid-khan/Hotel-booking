const db = require("../config/db.js");

// ==================== CREATE NEW HOTEL (Admin only) ====================
exports.createHotel = async (req, res) => {
    try {
        const { name, address, description } = req.body;
        const adminId = req.user.id;

        const query = 'INSERT INTO hotels (admin_id, name, address, description) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(query, [adminId, name, address, description]);

        const hotelId = result.insertId;

        res.status(201).json({
            success: true,
            message: 'Hotel created successfully',
            hotel: {
                id: hotelId,
                name,
                address,
                description
            }
        });
    } catch (err) {
        console.error("Error creating hotel:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== GET ALL HOTELS OF LOGGED-IN ADMIN ====================
exports.getAdminHotels = async (req, res) => {
    try {
        const adminId = req.user.id;
        const query = 'SELECT id, name, address, description FROM hotels WHERE admin_id = ?';
        const [hotels] = await db.execute(query, [adminId]);

        res.json({ success: true, hotels });
    } catch (err) {
        console.error("Error fetching admin hotels:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== CHECK HOTEL FOR ANY USER ====================
// Admin: simply check if at least one hotel exists
// Staff/User: fetch hotelId from users table and get its name
exports.checkHotel = async (req, res) => {
    try {
        const { id: userId, role } = req.user;

        if (role === "admin") {
            // For admin -> return first hotel name if exists
            const [rows] = await db.execute(
                'SELECT id, name FROM hotels WHERE admin_id = ? LIMIT 1',
                [userId]
            );

            if (rows.length > 0) {
                return res.json({
                    success: true,
                    hasHotel: true,
                    hotelId: rows[0].id,
                    hotelName: rows[0].name
                });
            } else {
                return res.json({
                    success: true,
                    hasHotel: false,
                    hotelId: null,
                    hotelName: null
                });
            }
        } else {
            // For staff/user -> get hotelId from users table
            const [userRows] = await db.execute(
                'SELECT hotelId FROM users WHERE id = ?',
                [userId]
            );

            if (!userRows.length || !userRows[0].hotelId) {
                return res.json({
                    success: true,
                    hasHotel: false,
                    hotelId: null,
                    hotelName: null
                });
            }

            const hotelId = userRows[0].hotelId;

            const [hotelRows] = await db.execute(
                'SELECT name FROM hotels WHERE id = ?',
                [hotelId]
            );

            if (!hotelRows.length) {
                return res.json({
                    success: true,
                    hasHotel: false,
                    hotelId: null,
                    hotelName: null
                });
            }

            return res.json({
                success: true,
                hasHotel: true,
                hotelId,
                hotelName: hotelRows[0].name
            });
        }
    } catch (err) {
        console.error("Error checking hotel:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== UPDATE HOTEL (Admin only) ====================
exports.updateHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, description } = req.body;
        const adminId = req.user.id;

        const query = 'UPDATE hotels SET name = ?, address = ?, description = ? WHERE id = ? AND admin_id = ?';
        const [result] = await db.execute(query, [name, address, description, id, adminId]);

        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, message: 'Hotel not found or access denied' });

        res.json({ success: true, message: 'Hotel updated successfully' });
    } catch (err) {
        console.error("Error updating hotel:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== DELETE HOTEL (Admin only) ====================
exports.deleteHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        const query = 'DELETE FROM hotels WHERE id = ? AND admin_id = ?';
        const [result] = await db.execute(query, [id, adminId]);

        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, message: 'Hotel not found or access denied' });

        res.json({ success: true, message: 'Hotel deleted successfully' });
    } catch (err) {
        console.error("Error deleting hotel:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
