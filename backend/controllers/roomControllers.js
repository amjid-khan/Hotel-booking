const pool = require('../config/db');

// Add new room
exports.addRoom = async (req, res) => {
    const { roomNumber, type, price, image, capacity, description } = req.body;

    // Validation
    if (!roomNumber || !type || !price || !capacity) {
        return res.status(400).json({ message: 'roomNumber, type, price, and capacity are required' });
    }

    try {
        const [existing] = await pool.query('SELECT * FROM rooms WHERE roomNumber = ?', [roomNumber]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Room number already exists' });
        }

        await pool.query(
            `INSERT INTO rooms (roomNumber, type, price, image, capacity, description) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [roomNumber, type, price, image || null, capacity, description || null]
        );

        res.status(201).json({ message: 'Room added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all rooms
exports.getAllRooms = async (req, res) => {
    try {
        const [rooms] = await pool.query('SELECT * FROM rooms');
        res.json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update room
exports.updateRoom = async (req, res) => {
    const { id } = req.params;
    const { roomNumber, type, price, image, capacity, description } = req.body;

    try {
        const [existing] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await pool.query(
            `UPDATE rooms 
             SET roomNumber = ?, type = ?, price = ?, image = ?, capacity = ?, description = ? 
             WHERE id = ?`,
            [
                roomNumber || existing[0].roomNumber,
                type || existing[0].type,
                price || existing[0].price,
                image || existing[0].image,
                capacity || existing[0].capacity,
                description || existing[0].description,
                id,
            ]
        );

        res.json({ message: 'Room updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete room
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
