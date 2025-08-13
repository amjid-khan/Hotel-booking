const pool = require('../config/db');

const getBookingsByUserId = async (userId) => {
    const [rows] = await pool.query(
        `SELECT b.id, b.fromDate, b.toDate, b.status, r.roomNumber, r.type, r.price 
     FROM bookings b
     JOIN rooms r ON b.roomId = r.id
     WHERE b.userId = ?`,
        [userId]
    );
    return rows;
};

const getBookingById = async (bookingId) => {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    return rows[0];
};

const createBooking = async ({ userId, roomId, fromDate, toDate }) => {
    const [result] = await pool.query(
        'INSERT INTO bookings (userId, roomId, fromDate, toDate) VALUES (?, ?, ?, ?)',
        [userId, roomId, fromDate, toDate]
    );
    return result.insertId;
};

const cancelBooking = async (bookingId, userId) => {
    const [result] = await pool.query(
        'UPDATE bookings SET status = ? WHERE id = ? AND userId = ?',
        ['cancelled', bookingId, userId]
    );
    return result.affectedRows > 0;
};

module.exports = {
    getBookingsByUserId,
    getBookingById,
    createBooking,
    cancelBooking,
};
