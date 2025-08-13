const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Get logged-in user's profile
exports.getUserProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const [users] = await pool.query('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update logged-in user's profile (name, email, password)
exports.updateUserProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, email, password } = req.body;

    try {
        // Check if email is changing & already taken by someone else
        if (email) {
            const [emailCheck] = await pool.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
            if (emailCheck.length > 0) return res.status(400).json({ message: 'Email already in use' });
        }

        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Build dynamic update query
        let fields = [];
        let values = [];

        if (name) {
            fields.push('name = ?');
            values.push(name);
        }
        if (email) {
            fields.push('email = ?');
            values.push(email);
        }
        if (hashedPassword) {
            fields.push('password = ?');
            values.push(hashedPassword);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message: 'Nothing to update' });
        }

        values.push(userId);

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

        await pool.query(sql, values);

        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin or Superadmin: Get list of all users
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, name, email, role FROM users');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Admin or Superadmin: Delete a user by id
exports.deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
