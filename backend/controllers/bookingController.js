const pool = require('../config/db');

exports.bookRoom = async (req, res) => {
    const userId = req.user.id;
    const { roomId, fromDate, toDate } = req.body;

    if (!roomId || !fromDate || !toDate) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (new Date(fromDate) > new Date(toDate)) {
        return res.status(400).json({ message: 'Invalid date range' });
    }

    try {
        const [rooms] = await pool.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
        if (rooms.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await pool.query(
            'INSERT INTO bookings (userId, roomId, fromDate, toDate, status) VALUES (?, ?, ?, ?, ?)',
            [userId, roomId, fromDate, toDate, 'booked']
        );

        res.status(201).json({ message: 'Room booked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserBookings = async (req, res) => {
    const userId = req.user.id;

    try {
        const [bookings] = await pool.query(
            `SELECT b.id, b.fromDate, b.toDate, b.status, r.roomNumber, r.type, r.price
            FROM bookings b
            JOIN rooms r ON b.roomId = r.id
            WHERE b.userId = ?`,
            [userId]
        );
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.cancelBooking = async (req, res) => {
    const userId = req.user.id;
    const bookingId = req.params.id;

    try {
        const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ? AND userId = ?', [
            bookingId,
            userId,
        ]);

        if (bookings.length === 0) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        await pool.query('UPDATE bookings SET status = ? WHERE id = ? AND userId = ?', [
            'cancelled',
            bookingId,
            userId,
        ]);

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};