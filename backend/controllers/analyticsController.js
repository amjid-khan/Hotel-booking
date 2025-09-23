// controllers/analyticsController.js
const { Booking, Hotel, Room, sequelize } = require("../models");
const { Op } = require("sequelize");

// 🔹 Get overall revenue + stats (superadmin)

exports.getRevenue = async (req, res) => {
    try {
        const { hotelId, startDate, endDate } = req.query;

        // Filter setup
        const where = { status: "confirmed" };

        if (hotelId) {
            where.hotelId = hotelId;
        }

        if (startDate && endDate) {
            where.checkIn = { [Op.gte]: new Date(startDate) };
            where.checkOut = { [Op.lte]: new Date(endDate) };
        }

        // Aggregation query
        const stats = await Booking.findAll({
            where,
            attributes: [
                "hotelId",
                [sequelize.fn("COUNT", sequelize.col("Booking.id")), "totalBookings"], // ✅ FIX
                [sequelize.fn("SUM", sequelize.col("Booking.guests")), "totalGuests"], // ✅ FIX
                [sequelize.fn("SUM", sequelize.col("Booking.totalAmount")), "totalRevenue"], // ✅ FIX
            ],
            group: ["Booking.hotelId"], // ✅ FIX
            include: [
                {
                    model: Hotel,
                    attributes: ["id", "name"]
                }
            ]
        });

        res.json({ success: true, data: stats });
    } catch (err) {
        console.error("Error in getRevenue:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
// 🔹 Get monthly revenue trend
exports.getMonthlyRevenue = async (req, res) => {
    try {
        const { hotelId } = req.query;

        const where = { status: "confirmed" };
        if (hotelId) where.hotelId = hotelId;

        const stats = await Booking.findAll({
            where,
            attributes: [
                [sequelize.fn("DATE_FORMAT", sequelize.col("checkIn"), "%Y-%m"), "month"],
                [sequelize.fn("SUM", sequelize.col("totalAmount")), "revenue"],
                [sequelize.fn("COUNT", sequelize.col("id")), "bookings"]
            ],
            group: [sequelize.fn("DATE_FORMAT", sequelize.col("checkIn"), "%Y-%m")],
            order: [[sequelize.fn("DATE_FORMAT", sequelize.col("checkIn"), "%Y-%m"), "ASC"]]
        });

        res.json({ success: true, data: stats });
    } catch (err) {
        console.error("Error in getMonthlyRevenue:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 🔹 Occupancy rate (rooms booked vs total rooms)
exports.getOccupancy = async (req, res) => {
    try {
        const { hotelId } = req.query;

        if (!hotelId) {
            return res.status(400).json({ success: false, message: "hotelId required" });
        }

        // Total rooms in hotel
        const totalRooms = await Room.count({ where: { hotelId } });

        // Currently occupied rooms
        const today = new Date();
        const occupiedRooms = await Booking.count({
            where: {
                hotelId,
                status: "confirmed",
                checkIn: { [Op.lte]: today },
                checkOut: { [Op.gte]: today }
            }
        });

        const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

        res.json({
            success: true,
            data: {
                totalRooms,
                occupiedRooms,
                occupancyRate: occupancyRate.toFixed(2)
            }
        });
    } catch (err) {
        console.error("Error in getOccupancy:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
