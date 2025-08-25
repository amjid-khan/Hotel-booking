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

        // Insert user 
        // NOTE: hotelId sirf tab pass karna hai jab role 'staff' ya non-admin ho
        let query, params;

        if (role === 'admin') {
            query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
            params = [name, email, hashedPassword, role];
        } else {
            query = 'INSERT INTO users (name, email, password, role, hotelId) VALUES (?, ?, ?, ?, ?)';
            params = [name, email, hashedPassword, role, hotelId || null];
        }

        const [result] = await pool.query(query, params);

        const user = {
            id: result.insertId,
            name,
            email,
            role,
            hotelId: role === 'admin' ? null : (hotelId || null)
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

        // Remove password from response
        delete user.password;

        // Token generate
        const token = generateToken(user);

        // For admin → hotelId not required
        // For staff → send hotelId if exists
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                hotelId: user.role === 'admin' ? null : user.hotelId
            },
            token,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
