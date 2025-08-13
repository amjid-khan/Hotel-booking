const pool = require('../config/db');

exports.addRoom = async (req, res) => {
    const { roomNumber, type, price } = req.body;
    if (!roomNumber || !type || !price) {
        return res.status(400).json({ message: 'All fields required' });
    }

    try {
        const [existing] = await pool.query('SELECT * FROM rooms WHERE roomNumber = ?', [roomNumber]);
        if (existing.length > 0) return res.status(400).json({ message: 'Room already exists' });

        await pool.query('INSERT INTO rooms (roomNumber, type, price) VALUES (?, ?, ?)', [
            roomNumber,
            type,
            price,
        ]);
        res.status(201).json({ message: 'Room added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRooms = async (req, res) => {
    try {
        const [rooms] = await pool.query('SELECT * FROM rooms');
        res.json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
