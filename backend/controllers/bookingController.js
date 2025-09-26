const { Booking, Room, Hotel } = require("../models");
const { Op } = require("sequelize");

module.exports = {

    createBooking: async (req, res) => {
        try {
            const {
                hotelId,
                roomId,
                guestName,
                guestEmail, // only for admin/superadmin
                guestPhone,
                checkIn,
                checkOut,
                guests,
                totalAmount,
            } = req.body;

            if (
                !hotelId ||
                !roomId ||
                !guestName ||
                !checkIn ||
                !checkOut ||
                !totalAmount
            ) {
                return res.status(400).json({ message: "Required fields missing" });
            }

            // ✅ email decide based on role
            let finalGuestEmail;

            if (req.user.role === "admin" || req.user.role === "superadmin") {
                // admin can specify email
                if (!guestEmail) {
                    return res
                        .status(400)
                        .json({ message: "Guest email required for admin booking" });
                }
                finalGuestEmail = guestEmail;
            } else {
                // normal user/staff → always use their JWT email
                finalGuestEmail = req.user.email;
            }

            // Overlap check against existing CONFIRMED bookings for same room
            const overlapExists = await Booking.findOne({
                where: {
                    hotelId,
                    roomId,
                    status: "confirmed",
                    // Overlap: existing.checkIn < newCheckOut AND existing.checkOut > newCheckIn
                    checkIn: { [Op.lt]: new Date(checkOut) },
                    checkOut: { [Op.gt]: new Date(checkIn) },
                },
                include: [
                    { model: Room, attributes: ["id", "type", "roomNumber"] },
                    { model: Hotel, attributes: ["id", "name"] },
                ],
            });

            if (overlapExists) {
                return res.status(409).json({
                    message: "Room is unavailable for the selected dates",
                    code: "ROOM_UNAVAILABLE",
                    conflict: {
                        id: overlapExists.id,
                        roomId: overlapExists.roomId,
                        hotelId: overlapExists.hotelId,
                        checkIn: overlapExists.checkIn,
                        checkOut: overlapExists.checkOut,
                        room: overlapExists.Room,
                        hotel: overlapExists.Hotel,
                        status: overlapExists.status,
                    }
                });
            }

            const booking = await Booking.create({
                hotelId,
                roomId,
                guestName,
                guestEmail: finalGuestEmail,
                guestPhone,
                checkIn,
                checkOut,
                guests,
                totalAmount,
                status: "pending", // ✅ Use lowercase for consistency
            });

            // ✅ FIXED: Fetch the booking with room and hotel data
            const bookingWithDetails = await Booking.findByPk(booking.id, {
                include: [
                    { model: Room, attributes: ["id", "type", "roomNumber", "price"] },
                    { model: Hotel, attributes: ["id", "name"] },
                ],
            });

            // debug removed

            res.status(201).json({
                message: "Booking created successfully",
                booking: bookingWithDetails,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }
    },

    // Fetch all bookings for a specific hotel (fixed)
    getHotelBookings: async (req, res) => {
        try {
            const { hotelId } = req.params;

            if (!hotelId) {
                return res.status(400).json({ message: "Hotel ID is required" });
            }

            // Convert hotelId to integer to avoid type mismatch
            const bookings = await Booking.findAll({
                where: { hotelId: parseInt(hotelId) },
                include: [
                    { model: Room, attributes: ["id", "type", "roomNumber", "price"] },
                    { model: Hotel, attributes: ["id", "name"] },
                ],
                order: [["createdAt", "DESC"]],
            });

            res.status(200).json({ bookings });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }
    },

    // Get confirmed bookings for the logged-in user's hotel (for user role)
    getConfirmedForHotel: async (req, res) => {
        try {
            let hotelId = null;
            // Prefer explicit query for admins/superadmins; users use their assigned hotelId
            if (req.user.role === 'superadmin' || req.user.role === 'admin') {
                hotelId = req.query.hotelId ? parseInt(req.query.hotelId, 10) : (req.user.hotelId || null);
            } else {
                hotelId = req.user.hotelId || null;
            }

            if (!hotelId || isNaN(hotelId)) {
                return res.status(400).json({ message: 'hotelId is required' });
            }

            const bookings = await Booking.findAll({
                where: {
                    hotelId,
                    status: 'confirmed',
                },
                attributes: ['id', 'hotelId', 'roomId', 'checkIn', 'checkOut', 'status'],
                order: [['checkIn', 'ASC']],
            });

            return res.json({ bookings });
        } catch (error) {
            console.error('Error fetching confirmed bookings for hotel:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    },

    // Cancel a booking
    cancelBooking: async (req, res) => {
        try {
            const { bookingId } = req.params;

            const booking = await Booking.findByPk(bookingId);
            if (!booking)
                return res.status(404).json({ message: "Booking not found" });

            booking.status = "cancelled";
            await booking.save();

            res
                .status(200)
                .json({ message: "Booking cancelled successfully", booking });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }
    },

    //     try {
    //         const userEmail = req.user.email;

    //         // ✅ Har role ke liye apni hi bookings dikhani hain
    //         const bookings = await Booking.findAll({
    //             where: { guestEmail: userEmail },
    //             include: [
    //                 { model: Room, attributes: ["id", "type", "roomNumber", "price"] },
    //                 { model: Hotel, attributes: ["id", "name"] },
    //             ],
    //             order: [["createdAt", "DESC"]],
    //         });

    //         res.status(200).json({ bookings });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ message: "Server error", error });
    //     }
    // },

    // Fixed backend controller - make sure email filtering is strict
    getMyBookings: async (req, res) => {
        try {
            const userEmail = req.user.email;
            const hotelId = req.query.hotelId ? parseInt(req.query.hotelId) : null;

            // Build query dynamically but ALWAYS filter by user email
            const whereClause = {
                guestEmail: userEmail, // ✅ This must always be present
            };

            // Only add hotelId filter if provided (optional)
            if (hotelId) {
                whereClause.hotelId = hotelId;
            }

            console.log("Filtering bookings for email:", userEmail); // Debug log
            console.log("Where clause:", whereClause); // Debug log

            const bookings = await Booking.findAll({
                where: whereClause,
                include: [
                    { model: Room, attributes: ["id", "type", "roomNumber", "price"] },
                    { model: Hotel, attributes: ["id", "name"] },
                ],
                order: [["createdAt", "DESC"]],
            });

            console.log("Found bookings:", bookings.length); // Debug log

            res.status(200).json({ bookings });
        } catch (error) {
            console.error("Error in getMyBookings:", error);
            res.status(500).json({ message: "Server error", error });
        }
    },

    deleteBooking: async (req, res) => {
        try {
            const { bookingId } = req.params;

            const booking = await Booking.findByPk(bookingId);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            await booking.destroy(); // ✅ DB se record delete hoga

            res.status(200).json({ message: "Booking deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }
    },

    // Admin: Update booking status
    updateStatus: async (req, res) => {
        try {
            const { bookingId } = req.params;
            const { status } = req.body; // expected: "confirmed" | "cancelled"

            const booking = await Booking.findByPk(bookingId);
            if (!booking) {
                return res.status(404).json({ message: "Booking not found" });
            }

            // Only allow valid statuses
            if (!["confirmed", "cancelled", "pending"].includes(status)) {
                return res.status(400).json({ message: "Invalid status" });
            }

            // If confirming, ensure no overlap with other confirmed bookings
            if (status === "confirmed") {
                const conflict = await Booking.findOne({
                    where: {
                        id: { [Op.ne]: booking.id },
                        hotelId: booking.hotelId,
                        roomId: booking.roomId,
                        status: "confirmed",
                        // Overlap with this booking's dates
                        checkIn: { [Op.lt]: booking.checkOut },
                        checkOut: { [Op.gt]: booking.checkIn },
                    },
                    include: [
                        { model: Room, attributes: ["id", "type", "roomNumber"] },
                        { model: Hotel, attributes: ["id", "name"] },
                    ],
                });

                if (conflict) {
                    return res.status(409).json({
                        message: "Room already booked for these dates",
                        code: "ROOM_UNAVAILABLE",
                        conflict: {
                            id: conflict.id,
                            roomId: conflict.roomId,
                            hotelId: conflict.hotelId,
                            checkIn: conflict.checkIn,
                            checkOut: conflict.checkOut,
                            room: conflict.Room,
                            hotel: conflict.Hotel,
                            status: conflict.status,
                        }
                    });
                }
            }

            booking.status = status;
            await booking.save();

            // debug removed

            res
                .status(200)
                .json({ message: `Booking ${status} successfully`, booking });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }
    },
    // getHotelBookings: async (req, res) => {
    //     try {
    //         const { hotelId } = req.params;

    //         let bookings;

    //         // superadmin case → sab hotels ke bookings
    //         if (req.user.role === "superadmin") {
    //             bookings = await Booking.findAll({
    //                 include: [
    //                     { model: Room, attributes: ["id", "type", "roomNumber", "price"] },
    //                     { model: Hotel, attributes: ["id", "name"] }
    //                 ],
    //                 order: [["createdAt", "DESC"]],
    //             });
    //         } else {
    //             // hotelId validate karo
    //             const parsedHotelId = parseInt(hotelId, 10);
    //             if (isNaN(parsedHotelId)) {
    //                 return res.status(400).json({ message: "Invalid hotel ID" });
    //             }

    //             bookings = await Booking.findAll({
    //                 where: { hotelId: parsedHotelId },
    //                 include: [
    //                     { model: Room, attributes: ["id", "type", "roomNumber", "price"] },
    //                     { model: Hotel, attributes: ["id", "name"] }
    //                 ],
    //                 order: [["createdAt", "DESC"]],
    //             });
    //         }

    //         // 🔹 Hotel ka name response me add karna
    //         const formattedBookings = bookings.map(b => ({
    //             id: b.id,
    //             hotelId: b.hotelId,
    //             hotelName: b.Hotel ? b.Hotel.name : null,
    //             room: b.Room,
    //             guestName: b.guestName,
    //             guestEmail: b.guestEmail,
    //             guestPhone: b.guestPhone,
    //             checkIn: b.checkIn,
    //             checkOut: b.checkOut,
    //             guests: b.guests,
    //             totalAmount: b.totalAmount,
    //             status: b.status,
    //             createdAt: b.createdAt,
    //             updatedAt: b.updatedAt
    //         }));

    //         res.status(200).json({ bookings: formattedBookings });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ message: "Server error", error });
    //     }
    // },

    getHotelBookings: async (req, res) => {
        try {
            const { hotelId } = req.params;
            let bookings;

            if (req.user.role === "superadmin") {
                // Superadmin sees all bookings across all hotels
                bookings = await Booking.findAll({
                    include: [
                        { model: Room, attributes: ["id", "type", "roomNumber", "price"] },
                        { model: Hotel, attributes: ["id", "name"] },
                    ],
                    order: [["createdAt", "DESC"]],
                });
            } else {
                // Admin or staff → only bookings for their hotel
                const parsedHotelId = parseInt(hotelId, 10);
                if (isNaN(parsedHotelId)) {
                    return res.status(400).json({ message: "Invalid hotel ID" });
                }

                bookings = await Booking.findAll({
                    where: { hotelId: parsedHotelId },
                    include: [
                        { model: Room, attributes: ["id", "type", "roomNumber", "price"] },
                        { model: Hotel, attributes: ["id", "name"] },
                    ],
                    order: [["createdAt", "DESC"]],
                });
            }

            const formattedBookings = bookings.map((b) => ({
                id: b.id,
                hotelId: b.hotelId,
                hotelName: b.Hotel ? b.Hotel.name : null,
                room: b.Room,
                guestName: b.guestName,
                guestEmail: b.guestEmail,
                guestPhone: b.guestPhone,
                checkIn: b.checkIn,
                checkOut: b.checkOut,
                guests: b.guests,
                totalAmount: b.totalAmount,
                status: b.status,
                createdAt: b.createdAt,
                updatedAt: b.updatedAt,
            }));

            res.status(200).json({ bookings: formattedBookings });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }
    },

    // Superadmin: Get revenue summary
    getRevenue: async (req, res) => {
        try {
            if (req.user.role !== "superadmin") {
                return res.status(403).json({ message: "Access denied" });
            }

            // Sab confirmed bookings fetch karo
            const bookings = await Booking.findAll({
                where: { status: "confirmed" },
                include: [{ model: Hotel, attributes: ["id", "name"] }],
            });

            // Revenue calculation per hotel
            const revenuePerHotel = {};
            let totalRevenue = 0;

            bookings.forEach((b) => {
                const hotelName = b.Hotel.name;
                if (!revenuePerHotel[hotelName]) revenuePerHotel[hotelName] = 0;
                revenuePerHotel[hotelName] += parseFloat(b.totalAmount);
                totalRevenue += parseFloat(b.totalAmount);
            });

            res.status(200).json({
                totalRevenue,
                revenuePerHotel,
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }
    },
};
