const { Hotel, User, Room } = require("../models");

// ==================== CREATE NEW HOTEL (Admin only) ====================
exports.createHotel = async (req, res) => {
    try {
        const {
            name, address, description,
            email, city, state, country, zip, phone
        } = req.body;

        const adminId = req.user.id;

        const hotel = await Hotel.create({
            adminId,
            name,
            address,
            description,
            email,
            city,
            state,
            country,
            zip,
            phone
        });

        res.status(201).json({
            success: true,
            message: 'Hotel created successfully',
            hotel
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
        const hotels = await Hotel.findAll({
            where: { adminId },
            attributes: ['id', 'name', 'address', 'description', 'email', 'city', 'state', 'country', 'zip', 'phone']
        });

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
            const hotel = await Hotel.findOne({
                where: { adminId: userId },
                attributes: ['id', 'name']
            });

            if (hotel) {
                return res.json({
                    success: true,
                    hasHotel: true,
                    hotelId: hotel.id,
                    hotelName: hotel.name
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
            const user = await User.findByPk(userId);
            if (!user || !user.hotelId) {
                return res.json({
                    success: true,
                    hasHotel: false,
                    hotelId: null,
                    hotelName: null
                });
            }

            const hotel = await Hotel.findByPk(user.hotelId, { attributes: ['name'] });
            if (!hotel) {
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
                hotelId: user.hotelId,
                hotelName: hotel.name
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

        let hotel;
        if (role === 'superadmin') {
            hotel = await Hotel.findByPk(id);
        } else {
            hotel = await Hotel.findOne({ where: { id, adminId: userId } });
        }

        if (!hotel)
            return res.status(404).json({ success: false, message: 'Hotel not found or access denied' });

        await hotel.update({
            name, address, description, email, city, state, country, zip, phone
        });

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

        let hotel;
        if (role === 'superadmin') {
            hotel = await Hotel.findByPk(id);
        } else {
            hotel = await Hotel.findOne({ where: { id, adminId: userId } });
        }

        if (!hotel)
            return res.status(404).json({ success: false, message: 'Hotel not found or access denied' });

        await hotel.destroy();

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

        let hotel;
        if (role === 'superadmin') {
            hotel = await Hotel.findOne({
                where: { id },
                include: [{
                    model: User,
                    as: 'admin',
                    attributes: ['name', 'email']
                }]
            });
        } else {
            hotel = await Hotel.findOne({
                where: { id, adminId: userId }
            });
        }

        if (!hotel) {
            return res.status(404).json({ success: false, message: 'Hotel not found or access denied' });
        }

        let hotelData = hotel.toJSON();
        if (role === 'superadmin' && hotel.admin) {
            hotelData.adminName = hotel.admin.name;
            hotelData.adminEmail = hotel.admin.email;
        }

        res.json({ success: true, hotel: hotelData });
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

        const hotels = await Hotel.findAll({
            include: [
                {
                    model: User,
                    as: 'admin',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Room,
                    attributes: []
                }
            ],
            attributes: {
                include: [
                    [Hotel.sequelize.fn('COUNT', Hotel.sequelize.col('Rooms.id')), 'totalRooms']
                ]
            },
            group: ['Hotel.id'],
            order: [['id', 'DESC']]
        });

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
        const user = await User.findByPk(userId);
        if (!user || !user.hotelId) {
            return res.status(404).json({
                success: false,
                message: 'No hotel assigned to this user'
            });
        }

        const hotel = await Hotel.findOne({
            where: { id: user.hotelId },
            include: [{
                model: User,
                as: 'admin',
                attributes: ['name', 'email']
            }]
        });

        if (!hotel) {
            return res.status(404).json({
                success: false,
                message: 'Hotel not found'
            });
        }

        // Get additional hotel stats (rooms, etc.)
        const totalRooms = await Room.count({ where: { hotelId: user.hotelId } });
        const availableRooms = await Room.count({ where: { hotelId: user.hotelId, isAvailable: true } });
        // You can add more stats as needed

        const hotelData = hotel.toJSON();
        hotelData.stats = {
            totalRooms,
            availableRooms
        };

        res.json({
            success: true,
            message: 'Hotel dashboard data retrieved successfully',
            hotel: hotelData,
            userRole: role
        });

    } catch (err) {
        console.error("Error fetching role hotel dashboard:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};