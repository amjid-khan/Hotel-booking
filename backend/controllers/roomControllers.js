const pool = require("../config/db");
const path = require("path");

// ------------------- ADD NEW ROOM -------------------
exports.addRoom = async (req, res) => {
    const { roomNumber, type, price, capacity, description, hotelId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Validation
    if (!roomNumber || !type || !price || !capacity || !hotelId) {
        return res.status(400).json({
            message: "roomNumber, type, price, capacity and hotelId are required",
        });
    }

    try {
        // Check duplicate room number for the same hotel
        const [existing] = await pool.query(
            "SELECT * FROM rooms WHERE roomNumber = ? AND hotelId = ?",
            [roomNumber, hotelId]
        );
        if (existing.length > 0) {
            return res
                .status(400)
                .json({ message: "Room number already exists for this hotel" });
        }

        // Insert new room
        await pool.query(
            `INSERT INTO rooms (roomNumber, type, price, image, capacity, description, hotelId, isAvailable) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                roomNumber,
                type,
                price,
                image,
                capacity,
                description || null,
                hotelId,
                1, // set available = 1
            ]
        );

        res.status(201).json({ message: "Room added successfully" });
    } catch (error) {
        console.error("Error adding room:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------- GET ALL ROOMS -------------------
exports.getAllRooms = async (req, res) => {
    try {
        const { hotelId } = req.query;
        let query = "SELECT * FROM rooms";
        let params = [];

        if (hotelId) {
            query += " WHERE hotelId = ?";
            params.push(hotelId);
        }

        const [rooms] = await pool.query(query, params);
        res.json(rooms);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------- UPDATE ROOM -------------------
exports.updateRoom = async (req, res) => {
    const { id } = req.params;
    const { roomNumber, type, price, capacity, description, hotelId } = req.body;

    try {
        // Check if room exists
        const [existing] = await pool.query("SELECT * FROM rooms WHERE id = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Check duplicate roomNumber for the same hotel (excluding current room)
        if (roomNumber && hotelId) {
            const [duplicate] = await pool.query(
                "SELECT * FROM rooms WHERE roomNumber = ? AND hotelId = ? AND id != ?",
                [roomNumber, hotelId, id]
            );
            if (duplicate.length > 0) {
                return res
                    .status(400)
                    .json({ message: "Room number already exists for this hotel" });
            }
        }

        const image = req.file ? `/uploads/${req.file.filename}` : existing[0].image;

        await pool.query(
            `UPDATE rooms 
             SET roomNumber = ?, type = ?, price = ?, image = ?, capacity = ?, description = ?, hotelId = ?
             WHERE id = ?`,
            [
                roomNumber || existing[0].roomNumber,
                type || existing[0].type,
                price || existing[0].price,
                image,
                capacity || existing[0].capacity,
                description || existing[0].description,
                hotelId || existing[0].hotelId,
                id,
            ]
        );

        res.json({ message: "Room updated successfully" });
    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------- DELETE ROOM -------------------
exports.deleteRoom = async (req, res) => {
    const { id } = req.params;

    try {
        const [existing] = await pool.query("SELECT * FROM rooms WHERE id = ?", [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: "Room not found" });
        }

        await pool.query("DELETE FROM rooms WHERE id = ?", [id]);
        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ message: "Server error" });
    }
};
