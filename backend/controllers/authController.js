// controllers/authController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

// ====================== REGISTER USER ======================
exports.registerUser = async (req, res) => {
    const { name, email, password, role, hotelId } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'name, email, password aur role required hain' });
    }

    try {
        // Check if user already exists
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user (hotelId optional hai)
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role, hotelId) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, hotelId]
        );

        const user = {
            id: result.insertId,
            name,
            email,
            role,
            hotelId: hotelId || null
        };

        const token = generateToken(user);

        res.status(201).json({ user, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ====================== LOGIN USER ======================
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email aur password required hain' });

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const user = users[0];

        // Password check
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Token generate
        const token = generateToken(user);

        // User info with hotelId included
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                hotelId: user.hotelId // <-- important!
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        // const { hotelId } = req.user; // from JWT payload

        const [users] = await pool.query(
            'SELECT id, name, email, role, hotelId FROM users WHERE role = "user" AND hotelId = ?',
            [hotelId]
        );

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted successfully', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};