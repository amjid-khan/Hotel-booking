const { User, Hotel } = require('../models');
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
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        let userData = {
            name: full_name,
            email,
            password: hashedPassword,
            role,
            phone: phone || null,
            profile_image,
            status: status || 'active'
        };
        if (role !== 'admin') userData.hotelId = hotelId || null;

        const user = await User.create(userData);

        const token = generateToken(user.toJSON());
        res.status(201).json({ user, token });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Token payload
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            hotelId: user.role === 'admin' ? null : user.hotelId
        };
        const token = generateToken(tokenPayload);

        // Fetch hotel details if user is not admin
        let hotelDetails = null;
        if (user.role !== 'admin' && user.hotelId) {
            hotelDetails = await Hotel.findByPk(user.hotelId);
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
                status: user.status || 'active',
                hotel: hotelDetails || null
            },
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
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

        if (profile_image && user.profile_image) {
            const oldImagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        let updateData = {
            name: full_name || user.name,
            email: email || user.email,
            password: hashedPassword,
            role: role || user.role,
            phone: phone || user.phone,
            profile_image: profile_image || user.profile_image,
            status: status || user.status
        };
        if (role !== 'admin') updateData.hotelId = hotelId || user.hotelId;

        await user.update(updateData);
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
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.profile_image) {
            const imagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await user.destroy();
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
        const users = await User.findAll({ where: { hotelId } });
        res.json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// ====================== GET ALL USERS (SUPERADMIN ONLY) ======================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
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
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

        if (profile_image && user.profile_image) {
            const oldImagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        let updateData = {
            name: full_name || user.name,
            email: email || user.email,
            password: hashedPassword,
            role: role || user.role,
            phone: phone || user.phone,
            profile_image: profile_image || user.profile_image,
            status: status || user.status
        };
        if ((role || user.role) !== 'admin' && (role || user.role) !== 'superadmin') {
            updateData.hotelId = hotelId || user.hotelId;
        }

        await user.update(updateData);
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
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.user && req.user.id === parseInt(id)) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        if (user.profile_image) {
            const imagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
        }

        await user.destroy();

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
