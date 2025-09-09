const { Room } = require("../models");
const fs = require("fs");
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
        const existing = await Room.findOne({
            where: { roomNumber, hotelId }
        });
        if (existing) {
            return res
                .status(400)
                .json({ message: "Room number already exists for this hotel" });
        }

        // Insert new room
        const room = await Room.create({
            roomNumber,
            type,
            price,
            image,
            capacity,
            description: description || null,
            hotelId,
            isAvailable: true
        });

        res.status(201).json({ message: "Room added successfully", room });
    } catch (error) {
        console.error("Error adding room:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------- GET ALL ROOMS -------------------
exports.getAllRooms = async (req, res) => {
    try {
        const { hotelId } = req.query;
        if (!hotelId) return res.status(400).json({ message: "hotelId is required" });

        const rooms = await Room.findAll({ where: { hotelId } });
        res.status(200).json({ rooms: rooms || [] });
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
        const room = await Room.findByPk(id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Prevent duplicate roomNumber in same hotel
        if (roomNumber && hotelId) {
            const duplicate = await Room.findOne({
                where: {
                    roomNumber,
                    hotelId,
                    id: { [Room.sequelize.Op.ne]: id }
                }
            });
            if (duplicate) {
                return res
                    .status(400)
                    .json({ message: "Room number already exists for this hotel" });
            }
        }

        // Handle image update
        let image = room.image;
        if (req.file) {
            // Delete old image if exists
            if (image) {
                const oldImagePath = path.join(__dirname, "../uploads", path.basename(image));
                if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
            }
            image = `/uploads/${req.file.filename}`;
        }

        await room.update({
            roomNumber: roomNumber || room.roomNumber,
            type: type || room.type,
            price: price || room.price,
            image,
            capacity: capacity || room.capacity,
            description: description || room.description,
            hotelId: hotelId || room.hotelId
        });

        res.status(200).json({ message: "Room updated successfully", room });
    } catch (error) {
        console.error("Error updating room:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ------------------- DELETE ROOM -------------------
exports.deleteRoom = async (req, res) => {
    const { id } = req.params;

    try {
        const room = await Room.findByPk(id);
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Delete image if exists
        const image = room.image;
        if (image) {
            const imgPath = path.join(__dirname, "../uploads", path.basename(image));
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }

        await room.destroy();
        res.status(200).json({ message: "Room deleted successfully" });
    } catch (error) {
        console.error("Error deleting room:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get rooms only for the user's assigned hotel
exports.getUserRooms = async (req, res) => {
    try {
        const { role, hotelId } = req.user; // Comes from authenticateToken middleware

        if (role !== 'user') {
            return res.status(403).json({ message: 'Access denied' });
        }

        if (!hotelId) {
            return res.status(400).json({ message: 'No hotel assigned to this user' });
        }

        const rooms = await Room.findAll({
            where: { hotelId },
            attributes: [
                'id',
                'roomNumber',
                'type',
                'price',
                'capacity',
                'description',
                'image',
                'isAvailable',
                'created_at',
                'updated_at'
            ]
        });

        res.json({ rooms });
    } catch (error) {
        console.error('Error fetching user rooms:', error);
        res.status(500).json({ message: 'Server error' });
    }
};