const db = require("../config/db.js");

// Create new hotel
// Create new hotel
exports.createHotel = async (req, res) => {
    try {
        const { name, address, description } = req.body;
        const adminId = req.user.id;

        const query = 'INSERT INTO hotels (admin_id, name, address, description) VALUES (?, ?, ?, ?)';
        const [result] = await db.execute(query, [adminId, name, address, description]);

        const hotelId = result.insertId;

        // Admin user ke hotelId ko update karo
        await db.execute('UPDATE users SET hotelId = ? WHERE id = ?', [hotelId, adminId]);

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
        res.status(500).json({ success: false, message: err.message });
    }
};


// Get all hotels of logged-in admin
exports.getAdminHotels = async (req, res) => {
    try {
        const adminId = req.user.id;
        const query = 'SELECT * FROM hotels WHERE admin_id = ?';
        const [hotels] = await db.execute(query, [adminId]);

        res.json({ success: true, hotels });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Check if logged-in admin has at least one hotel
// controller
exports.checkHotel = async (req, res) => {
    try {
        const adminId = req.user.id;
        const query = 'SELECT id, name FROM hotels WHERE admin_id = ? LIMIT 1';
        const [rows] = await db.execute(query, [adminId]);

        if (rows.length > 0) {
            return res.json({
                success: true,
                hasHotel: true,
                hotelName: rows[0].name
            });
        } else {
            return res.json({
                success: true,
                hasHotel: false,
                hotelName: null
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update hotel
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
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete hotel
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
        res.status(500).json({ success: false, message: err.message });
    }
};
