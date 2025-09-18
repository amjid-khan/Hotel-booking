const { Booking, Room, Hotel } = require('../models');

module.exports = {
    // Create a new booking
    createBooking: async (req, res) => {
        try {
            const {
                hotelId,
                roomId,
                guestName,
                guestEmail,
                guestPhone,
                checkIn,
                checkOut,
                guests,
                totalAmount
            } = req.body;

            if (!hotelId || !roomId || !guestName || !guestEmail || !checkIn || !checkOut || !totalAmount) {
                return res.status(400).json({ message: "Required fields missing" });
            }

            const booking = await Booking.create({
                hotelId,
                roomId,
                guestName,
                guestEmail,
                guestPhone,
                checkIn,
                checkOut,
                guests,
                totalAmount,
                status: "confirmed"
            });

            res.status(201).json({ message: "Booking created successfully", booking });
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
                    { model: Room, attributes: ['id', 'type', 'roomNumber', 'price'] },
                    { model: Hotel, attributes: ['id', 'name'] }
                ],
                order: [['createdAt', 'DESC']]
            });

            res.status(200).json({ bookings });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }
    },

    // Cancel a booking
    cancelBooking: async (req, res) => {
        try {
            const { bookingId } = req.params;

            const booking = await Booking.findByPk(bookingId);
            if (!booking) return res.status(404).json({ message: "Booking not found" });

            booking.status = "cancelled";
            await booking.save();

            res.status(200).json({ message: "Booking cancelled successfully", booking });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Server error", error });
        }
    }
};
