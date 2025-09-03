const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const fs = require('fs');
const path = require('path');

// ====================== REGISTER USER ======================
exports.registerUser = async (req, res) => {
    const { full_name, email, password, role, hotelId, phone, status } = req.body;
    const profile_image = req.file ? req.file.filename : null;

    if (!full_name || !email || !password || !role) {
        return res.status(400).json({ message: 'Full name, email, password, and role are required' });
    }

    try {
        // Check if email exists
        const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        let query, params;
        if (role === 'admin') {
            query = 'INSERT INTO users (name, email, password, role, phone, profile_image, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
            params = [full_name, email, hashedPassword, role, phone || null, profile_image, status || 'active'];
        } else {
            query = 'INSERT INTO users (name, email, password, role, hotelId, phone, profile_image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            params = [full_name, email, hashedPassword, role, hotelId || null, phone || null, profile_image, status || 'active'];
        }

        const [result] = await pool.query(query, params);

        const user = {
            id: result.insertId,
            full_name,
            email,
            role,
            hotelId: role === 'admin' ? null : (hotelId || null),
            phone: phone || null,
            profile_image,
            status: status || 'active'
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

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        delete user.password;

        // Build payload for token (including hotelId)
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            hotelId: user.role === 'admin' ? null : user.hotelId
        };

        const token = generateToken(tokenPayload);

        let hotelDetails = null;

        // Agar user admin nahi hai, tab hotel details fetch karo
        if (user.role !== 'admin' && user.hotelId) {
            const [hotels] = await pool.query('SELECT * FROM hotels WHERE id = ?', [user.hotelId]);
            if (hotels.length > 0) {
                hotelDetails = hotels[0];
            }
        }

        res.json({
            user: {
                id: user.id,
                full_name: user.name,
                email: user.email,
                role: user.role,
                hotelId: user.role === 'admin' ? null : user.hotelId,
                phone: user.phone || null,
                profile_image: user.profile_image || null,
                status: user.status || 'active'
            },
            hotel: hotelDetails,
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ====================== UPDATE USER ======================
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, password, role, hotelId, phone, status } = req.body;
    const profile_image = req.file ? req.file.filename : null;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

        if (profile_image && user.profile_image) {
            const oldImagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        let query, params;
        if (role === 'admin') {
            query = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, phone = ?, profile_image = ?, status = ? WHERE id = ?';
            params = [full_name || user.name, email || user.email, hashedPassword, role, phone || user.phone, profile_image || user.profile_image, status || user.status, id];
        } else {
            query = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, hotelId = ?, phone = ?, profile_image = ?, status = ? WHERE id = ?';
            params = [full_name || user.name, email || user.email, hashedPassword, role, hotelId || user.hotelId, phone || user.phone, profile_image || user.profile_image, status || user.status, id];
        }

        await pool.query(query, params);
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ====================== DELETE USER ======================
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        if (user.profile_image) {
            const imagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ====================== GET USERS FOR HOTEL ======================
exports.getHotelUsers = async (req, res) => {
    const { hotelId } = req.query;

    if (!hotelId) return res.status(400).json({ message: "hotelId is required" });

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE hotelId = ?', [hotelId]);
        res.json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ====================== GET ALL USERS (SUPERADMIN ONLY) ======================
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT * FROM users');
        res.json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ====================== UPDATE ANY USER (SUPERADMIN ONLY) ======================
exports.updateAnyUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, password, role, hotelId, phone, status } = req.body;
    const profile_image = req.file ? req.file.filename : null;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

        if (profile_image && user.profile_image) {
            const oldImagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        let query, params;
        if ((role || user.role) === 'admin' || (role || user.role) === 'superadmin') {
            query = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, phone = ?, profile_image = ?, status = ? WHERE id = ?';
            params = [full_name || user.name, email || user.email, hashedPassword, role || user.role, phone || user.phone, profile_image || user.profile_image, status || user.status, id];
        } else {
            query = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, hotelId = ?, phone = ?, profile_image = ?, status = ? WHERE id = ?';
            params = [full_name || user.name, email || user.email, hashedPassword, role || user.role, hotelId || user.hotelId, phone || user.phone, profile_image || user.profile_image, status || user.status, id];
        }

        await pool.query(query, params);
        res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ====================== DELETE ANY USER (SUPERADMIN ONLY) ======================
exports.deleteAnyUser = async (req, res) => {
    const { id } = req.params;

    try {
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        if (user.profile_image) {
            const imagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ====================== UPDATE ANY USER (SUPERADMIN ONLY) ======================
exports.updateAnyUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, password, role, hotelId, phone, status } = req.body;
    const profile_image = req.file ? req.file.filename : null;

    try {
        // Check if user exists
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        // Check if new email already exists (if email is being changed)
        if (email && email !== user.email) {
            const [existing] = await pool.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, id]);
            if (existing.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Hash password if provided
        const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

        // Handle profile image replacement
        if (profile_image && user.profile_image) {
            const oldImagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        // Update user with conditional logic for admin vs other roles
        let query, params;
        if ((role || user.role) === 'admin' || (role || user.role) === 'superadmin') {
            query = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, phone = ?, profile_image = ?, status = ? WHERE id = ?';
            params = [
                full_name || user.name,
                email || user.email,
                hashedPassword,
                role || user.role,
                phone || user.phone,
                profile_image || user.profile_image,
                status || user.status,
                id
            ];
        } else {
            query = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, hotelId = ?, phone = ?, profile_image = ?, status = ? WHERE id = ?';
            params = [
                full_name || user.name,
                email || user.email,
                hashedPassword,
                role || user.role,
                hotelId !== undefined ? hotelId : user.hotelId,
                phone || user.phone,
                profile_image || user.profile_image,
                status || user.status,
                id
            ];
        }

        await pool.query(query, params);

        // Get updated user data
        const [updatedUsers] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        const updatedUser = updatedUsers[0];
        delete updatedUser.password;

        res.json({
            success: true,
            message: 'User updated successfully',
            user: {
                id: updatedUser.id,
                full_name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                hotelId: updatedUser.hotelId || null,
                phone: updatedUser.phone || null,
                profile_image: updatedUser.profile_image || null,
                status: updatedUser.status || 'active'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ====================== DELETE ANY USER (SUPERADMIN ONLY) ======================
exports.deleteAnyUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if user exists
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];

        // Prevent superadmin from deleting themselves
        if (req.user && req.user.id === parseInt(id)) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Delete profile image if exists
        if (user.profile_image) {
            const imagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        // Delete user
        await pool.query('DELETE FROM users WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'User deleted successfully',
            deletedUserId: id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

