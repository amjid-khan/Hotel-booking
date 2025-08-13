const pool = require('../config/db');

const getAllRooms = async () => {
    const [rows] = await pool.query('SELECT * FROM rooms');
    return rows;
};

const getRoomById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id]);
    return rows[0];
};

const createRoom = async ({ roomNumber, type, price }) => {
    const [result] = await pool.query(
        'INSERT INTO rooms (roomNumber, type, price) VALUES (?, ?, ?)',
        [roomNumber, type, price]
    );
    return result.insertId;
};

const updateRoom = async (id, { roomNumber, type, price }) => {
    const fields = [];
    const values = [];

    if (roomNumber) {
        fields.push('roomNumber = ?');
        values.push(roomNumber);
    }
    if (type) {
        fields.push('type = ?');
        values.push(type);
    }
    if (price) {
        fields.push('price = ?');
        values.push(price);
    }
    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE rooms SET ${fields.join(', ')} WHERE id = ?`;

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
};

const deleteRoom = async (id) => {
    const [result] = await pool.query('DELETE FROM rooms WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
};
