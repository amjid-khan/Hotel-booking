const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getUserById = async (id) => {
    const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [id]);
    return rows[0];
};

const getUserByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const createUser = async ({ name, email, password, role = 'user' }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
    );
    return result.insertId;
};

const updateUser = async (id, { name, email, password }) => {
    const fields = [];
    const values = [];

    if (name) {
        fields.push('name = ?');
        values.push(name);
    }
    if (email) {
        fields.push('email = ?');
        values.push(email);
    }
    if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        fields.push('password = ?');
        values.push(hashedPassword);
    }
    if (fields.length === 0) return false;

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    const [result] = await pool.query(sql, values);
    return result.affectedRows > 0;
};

const deleteUser = async (id) => {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

const getAllUsers = async () => {
    const [rows] = await pool.query('SELECT id, name, email, role FROM users');
    return rows;
};

module.exports = {
    getUserById,
    getUserByEmail,
    createUser,
    updateUser,
    deleteUser,
    getAllUsers,
};