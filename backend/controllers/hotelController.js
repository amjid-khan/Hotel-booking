const db = require("../config/db.js");

// ==================== CREATE NEW HOTEL (Admin only) ====================
exports.createHotel = async (req, res) => {
    try {
        const {
            name, address, description,
            email, city, state, country, zip, phone
        } = req.body;

        const adminId = req.user.id;

        const query = `
            INSERT INTO hotels 
            (admin_id, name, address, description, email, city, state, country, zip, phone) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [
            adminId, name, address, description,
            email, city, state, country, zip, phone
        ]);

        const hotelId = result.insertId;

        res.status(201).json({
            success: true,
            message: 'Hotel created successfully',
            hotel: {
                id: hotelId,
                name,
                address,
                description,
                email,
                city,
                state,
                country,
                zip,
                phone
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
        const query = `
            SELECT id, name, address, description, email, city, state, country, zip, phone
            FROM hotels WHERE admin_id = ?
        `;
        const [hotels] = await db.execute(query, [adminId]);

        res.json({ success: true, hotels });
    } catch (err) {
        console.error("Error fetching admin hotels:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== CHECK HOTEL FOR ANY USER ====================
exports.checkHotel = async (req, res) => {
    try {
        const { id: userId, role } = req.user;

        if (role === "admin") {
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

// ==================== UPDATE HOTEL (Admin + Superadmin) ====================
exports.updateHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name, address, description,
            email, city, state, country, zip, phone
        } = req.body;
        const { id: userId, role } = req.user;

        let query, params;
        if (role === 'superadmin') {
            query = `
                UPDATE hotels 
                SET name = ?, address = ?, description = ?, 
                    email = ?, city = ?, state = ?, country = ?, zip = ?, phone = ?
                WHERE id = ?
            `;
            params = [name, address, description, email, city, state, country, zip, phone, id];
        } else {
            query = `
                UPDATE hotels 
                SET name = ?, address = ?, description = ?, 
                    email = ?, city = ?, state = ?, country = ?, zip = ?, phone = ?
                WHERE id = ? AND admin_id = ?
            `;
            params = [name, address, description, email, city, state, country, zip, phone, id, userId];
        }

        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, message: 'Hotel not found or access denied' });

        res.json({ success: true, message: 'Hotel updated successfully' });
    } catch (err) {
        console.error("Error updating hotel:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== DELETE HOTEL (Admin + Superadmin) ====================
exports.deleteHotel = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;

        let query, params;
        if (role === 'superadmin') {
            query = 'DELETE FROM hotels WHERE id = ?';
            params = [id];
        } else {
            query = 'DELETE FROM hotels WHERE id = ? AND admin_id = ?';
            params = [id, userId];
        }

        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0)
            return res.status(404).json({ success: false, message: 'Hotel not found or access denied' });

        res.json({ success: true, message: 'Hotel deleted successfully' });
    } catch (err) {
        console.error("Error deleting hotel:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== GET HOTEL BY ID (Admin + Superadmin) ====================
exports.getHotelById = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;

        let query, params;
        if (role === 'superadmin') {
            query = `
                SELECT h.id, h.name, h.address, h.description, h.email, 
                       h.city, h.state, h.country, h.zip, h.phone,
                       u.name AS adminName, u.email AS adminEmail
                FROM hotels h
                LEFT JOIN users u ON h.admin_id = u.id
                WHERE h.id = ?
            `;
            params = [id];
        } else {
            query = `
                SELECT id, name, address, description, email, city, state, country, zip, phone
                FROM hotels WHERE id = ? AND admin_id = ?
            `;
            params = [id, userId];
        }

        const [rows] = await db.execute(query, params);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Hotel not found or access denied' });
        }

        res.json({ success: true, hotel: rows[0] });
    } catch (err) {
        console.error("Error fetching hotel by ID:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ==================== GET ALL HOTELS (SUPERADMIN ONLY) ====================
exports.getAllHotelsSuperAdmin = async (req, res) => {
    try {
        const { role } = req.user;

        if (role !== "superadmin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Super Admin only."
            });
        }

        const query = `
            SELECT 
                h.id, 
                h.name, 
                h.address, 
                h.description, 
                h.email, 
                h.city, 
                h.state, 
                h.country, 
                h.zip, 
                h.phone,
                u.id AS adminId,
                u.name AS adminName, 
                u.email AS adminEmail,
                COUNT(r.id) AS totalRooms
            FROM hotels h
            LEFT JOIN users u ON h.admin_id = u.id
            LEFT JOIN rooms r ON h.id = r.hotelId
            GROUP BY h.id
            ORDER BY h.id DESC
        `;

        const [hotels] = await db.execute(query);

        res.json({ success: true, hotels });
    } catch (err) {
        console.error("Error fetching all hotels (superadmin):", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// ==================== GET ROLE'S ASSIGNED HOTEL DASHBOARD ====================
exports.getRoleHotelDashboard = async (req, res) => {
    try {
        const { id: userId, role } = req.user;

        // Skip for admin and superadmin - they have separate flows
        if (role === "admin" || role === "superadmin") {
            return res.status(403).json({
                success: false,
                message: "Use appropriate admin/superadmin endpoints"
            });
        }

        // Get user's assigned hotel ID
        const [userRows] = await db.execute(
            'SELECT hotelId FROM users WHERE id = ?',
            [userId]
        );

        if (!userRows.length || !userRows[0].hotelId) {
            return res.status(404).json({
                success: false,
                message: 'No hotel assigned to this user'
            });
        }

        const hotelId = userRows[0].hotelId;

        // Get complete hotel information
        const [hotelRows] = await db.execute(`
            SELECT 
                h.id, 
                h.name, 
                h.address, 
                h.description, 
                h.email, 
                h.city, 
                h.state, 
                h.country, 
                h.zip, 
                h.phone,
                u.name AS adminName,
                u.email AS adminEmail
            FROM hotels h
            LEFT JOIN users u ON h.admin_id = u.id
            WHERE h.id = ?
        `, [hotelId]);

        if (!hotelRows.length) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found'
            });
        }

        // Optional: Get additional hotel stats (rooms, bookings, etc.)
        const [roomStats] = await db.execute(`
            SELECT 
                COUNT(*) as totalRooms,
                COUNT(CASE WHEN status = 'available' THEN 1 END) as availableRooms,
                COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupiedRooms,
                COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenanceRooms
            FROM rooms 
            WHERE hotelId = ?
        `, [hotelId]);

        const hotel = {
            ...hotelRows[0],
            stats: roomStats[0] || {
                totalRooms: 0,
                availableRooms: 0,
                occupiedRooms: 0,
                maintenanceRooms: 0
            }
        };

        res.json({
            success: true,
            message: 'Hotel dashboard data retrieved successfully',
            hotel,
            userRole: role
        });

    } catch (err) {
        console.error("Error fetching role hotel dashboard:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};