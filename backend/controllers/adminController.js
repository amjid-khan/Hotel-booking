const pool = require('../config/db');

exports.addRoom = async (req, res) => {
    const { roomNumber, type, price } = req.body;

    if (!roomNumber || !type || !price) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const [existing] = await pool.query('SELECT * FROM rooms WHERE roomNumber = ?', [roomNumber]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Room number already exists' });
        }

        await pool.query('INSERT INTO rooms (roomNumber, type, price) VALUES (?, ?, ?)', [
            roomNumber,
            type,
            price,
        ]);

        res.status(201).json({ message: 'Room added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllRooms = async (req, res) => {
    try {
        const [rooms] = await pool.query('SELECT * FROM rooms');
        res.json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateRoom = async (req, res) => {
    const { id } = req.params;
    const { roomNumber, type, price } = req.body;

    try {
        const [existing] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await pool.query('UPDATE rooms SET roomNumber = ?, type = ?, price = ? WHERE id = ?', [
            roomNumber || existing[0].roomNumber,
            type || existing[0].type,
            price || existing[0].price,
            id,
        ]);

        res.json({ message: 'Room updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteRoom = async (req, res) => {
    const { id } = req.params;

    try {
        const [existing] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
        res.json({ message: 'Room deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
