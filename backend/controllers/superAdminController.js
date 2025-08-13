const pool = require('../config/db');

exports.getMonthlyBookingReport = async (req, res) => {
    const { year, month } = req.query;

    if (!year || !month) {
        return res.status(400).json({ message: 'Year and month are required' });
    }

    try {
        const [results] = await pool.query(
            `SELECT r.type, COUNT(b.id) AS totalBookings, SUM(r.price) AS totalRevenue
             FROM bookings b
             JOIN rooms r ON b.roomId = r.id
             WHERE YEAR(b.fromDate) = ? AND MONTH(b.fromDate) = ? AND b.status = 'booked'
             GROUP BY r.type`,
            [year, month]
        );

        res.json({ year, month, report: results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
