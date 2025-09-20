const { User, Hotel, Role, Permission } = require('../models');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const fs = require('fs');
const path = require('path');

// ====================== REGISTER USER ======================
// exports.registerUser = async (req, res) => {
//     const { full_name, email, password, phone, status, roleId, hotel_role } = req.body;
//     const profile_image = req.file ? req.file.filename : null;

//     if (!full_name || !email || !password) {
//         return res.status(400).json({ message: 'Full name, email, and password are required' });
//     }

//     try {
//         // Check if email exists
//         const existing = await User.findOne({ where: { email } });
//         if (existing) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Determine the role to assign
//         let finalRoleId;
//         let roleName;

//         if (hotel_role) {
//             // If hotel_role is provided from frontend, find role by name
//             const role = await Role.findOne({ where: { name: hotel_role } });
//             if (!role) {
//                 return res.status(400).json({ message: 'Invalid hotel role specified' });
//             }
//             finalRoleId = role.id;
//             roleName = role.name;
//         } else if (roleId) {
//             // If roleId is provided, use it
//             const role = await Role.findByPk(roleId);
//             if (!role) {
//                 return res.status(400).json({ message: 'Role not found' });
//             }
//             finalRoleId = roleId;
//             roleName = role.name;
//         } else {
//             // Default fallback - set to admin role
//             const defaultRole = await Role.findOne({ where: { name: 'admin' } });
//             if (!defaultRole) {
//                 return res.status(400).json({ message: 'Default admin role not found' });
//             }
//             finalRoleId = defaultRole.id;
//             roleName = defaultRole.name;
//         }

//         // HotelId set karna
//         let creatorHotelId = null;

//         // Agar request mein hotelId explicitly di gayi hai to use that
//         if (req.body.hotelId) {
//             creatorHotelId = req.body.hotelId;
//         }
//         // Otherwise, use the logged-in user's hotelId (except for superadmin)
//         else if (req.user && req.user.role !== 'superadmin' && req.user.hotelId) {
//             creatorHotelId = req.user.hotelId;
//         }

//         // Only superadmin should not have hotelId
//         if (roleName === 'superadmin') {
//             creatorHotelId = null;
//         }

//         // Debug: Check kar lete hain kya values aa rhi hain
//         console.log('=== USER CREATION DEBUG ===');
//         console.log('req.user:', req.user ? { id: req.user.id, role: req.user.role, hotelId: req.user.hotelId } : 'null');
//         console.log('req.body.hotelId:', req.body.hotelId);
//         console.log('roleName:', roleName);
//         console.log('finalRoleId:', finalRoleId);
//         console.log('creatorHotelId:', creatorHotelId);
//         console.log('==========================');

//         // User data prepare
//         let userData = {
//             name: full_name,
//             email,
//             password: hashedPassword,
//             roleId: finalRoleId,
//             phone: phone || null,
//             profile_image,
//             status: status || 'active',
//             hotelId: creatorHotelId // Ab ye properly set hoga
//         };

//         const user = await User.create(userData);

//         // Fetch the created user with role info
//         const createdUser = await User.findByPk(user.id, {
//             include: [{ model: Role, as: 'role' }]
//         });

//         const token = generateToken({
//             id: createdUser.id,
//             email: createdUser.email,
//             role: createdUser.role.name,
//             hotelId: createdUser.hotelId
//         });

//         res.status(201).json({
//             user: {
//                 id: createdUser.id,
//                 full_name: createdUser.name,
//                 email: createdUser.email,
//                 role: createdUser.role.name,
//                 hotelId: createdUser.hotelId,
//                 phone: createdUser.phone,
//                 profile_image: createdUser.profile_image,
//                 status: createdUser.status
//             },
//             token
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// ====================== REGISTER USER ======================
exports.registerUser = async (req, res) => {
    const { full_name, email, password, phone, status, roleId, hotel_role, hotelId } = req.body;
    const profile_image = req.file ? req.file.filename : null;

    if (!full_name || !email || !password) {
        return res.status(400).json({ message: 'Full name, email, and password are required' });
    }

    try {
        // Check if email exists
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Determine the role to assign
        let finalRoleId;
        let roleName;

        if (hotel_role) {
            // If hotel_role is provided from frontend, find role by name
            const role = await Role.findOne({ where: { name: hotel_role } });
            if (!role) {
                return res.status(400).json({ message: 'Invalid hotel role specified' });
            }
            finalRoleId = role.id;
            roleName = role.name;
        } else if (roleId) {
            // If roleId is provided, use it
            const role = await Role.findByPk(roleId);
            if (!role) {
                return res.status(400).json({ message: 'Role not found' });
            }
            finalRoleId = roleId;
            roleName = role.name;
        } else {
            // Default fallback - set to admin role
            const defaultRole = await Role.findOne({ where: { name: 'admin' } });
            if (!defaultRole) {
                return res.status(400).json({ message: 'Default admin role not found' });
            }
            finalRoleId = defaultRole.id;
            roleName = defaultRole.name;
        }

        // ✅ HotelId assignment
        let creatorHotelId = null;

        if (hotelId) {
            // if frontend explicitly sent hotelId
            creatorHotelId = hotelId;
        }

        // If role is superadmin → no hotel assigned
        if (roleName === 'superadmin') {
            creatorHotelId = null;
        }

        // User data prepare
        let userData = {
            name: full_name,
            email,
            password: hashedPassword,
            roleId: finalRoleId,
            phone: phone || null,
            profile_image,
            status: status || 'active',
            hotelId: creatorHotelId
        };

        const user = await User.create(userData);

        // Fetch the created user with role info
        const createdUser = await User.findByPk(user.id, {
            include: [{ model: Role, as: 'role' }]
        });

        // ✅ Safe token generation
        const token = generateToken({
            id: createdUser.id,
            email: createdUser.email,
            role: createdUser.role ? createdUser.role.name : 'user',
            hotelId: createdUser.hotelId || null,
            permissions: [] // default empty, login will fetch real permissions
        });

        res.status(201).json({
            user: {
                id: createdUser.id,
                full_name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role ? createdUser.role.name : 'user',
                hotelId: createdUser.hotelId,
                phone: createdUser.phone,
                profile_image: createdUser.profile_image,
                status: createdUser.status,
                permissions: [] // initial empty permissions
            },
            token
        });
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
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, as: 'role', include: [{ model: Permission, as: 'permissions' }] }]
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // ✅ Safe check for role
        if (!user.role) {
            return res.status(400).json({ message: 'User role not assigned or invalid' });
        }

        // ✅ Collect permissions
        const permissions = user.role.permissions
            ? user.role.permissions.map(p => p.name)
            : [];

        // let effectiveHotelId = user.role.name === 'admin' ? null : (user.hotelId || null);
        let effectiveHotelId = user.hotelId || null;



        // ✅ Add permissions in token payload
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role.name,
            hotelId: effectiveHotelId,
            permissions // 👈 add permissions here
        };
        const token = generateToken(tokenPayload);

        // ✅ Return user data + permissions (no hotelDetails)
        res.json({
            user: {
                id: user.id,
                full_name: user.name,
                email: user.email,
                role: user.role.name,
                hotelId: effectiveHotelId,
                phone: user.phone || null,
                profile_image: user.profile_image || null,
                status: user.status || 'active',
                permissions // 👈 return permissions also
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
    const { full_name, email, password, roleId, hotelId, phone, status } = req.body;
    const profile_image = req.file ? req.file.filename : null;

    try {
        const user = await User.findByPk(id, { include: [{ model: Role, as: 'role' }] });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

        if (profile_image && user.profile_image) {
            const oldImagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        let role = roleId ? await Role.findByPk(roleId) : user.role;
        if (!role) return res.status(400).json({ message: 'Invalid roleId' });

        let updateData = {
            name: full_name || user.name,
            email: email || user.email,
            password: hashedPassword,
            roleId: role.id,
            phone: phone || user.phone,
            profile_image: profile_image || user.profile_image,
            status: status || user.status
        };

        if (role.name !== 'admin') updateData.hotelId = hotelId || user.hotelId;

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
        const users = await User.findAll({
            where: { hotelId },
            include: [{ model: Role, as: 'role' }]
        });

        const hotels = await Hotel.findAll({ where: { id: hotelId } });
        const hotelMap = hotels.reduce((acc, h) => {
            acc[h.id] = h;
            return acc;
        }, {});

        const enriched = users.map(u => {
            const userJson = u.toJSON();

            return {
                ...userJson,
                full_name: `${userJson.first_name || ''} ${userJson.last_name || ''}`.trim(),
                role: u.role?.name || null,   // ✅ safe access
                hotel: hotelMap[u.hotelId] || null
            };
        });

        res.json({ users: enriched });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// ====================== GET ALL USERS (SUPERADMIN ONLY) ======================
// ====================== GET ALL USERS (SUPERADMIN ONLY) ======================
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [
                { model: Role, as: 'role' },          // role
                { model: Hotel, as: 'hotel', attributes: ['id', 'name'] } // hotel
            ]
        });

        const enriched = users.map(u => ({
            ...u.toJSON(),
            role: u.role.name,            // role name
            hotelName: u.hotel ? u.hotel.name : null  // hotel name
        }));

        res.json({ success: true, users: enriched });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// ====================== UPDATE ANY USER (SUPERADMIN ONLY) ======================
exports.updateAnyUser = async (req, res) => {
    const { id } = req.params;
    const { full_name, email, password, roleId, hotelId, phone, status } = req.body;
    const profile_image = req.file ? req.file.filename : null;

    try {
        const user = await User.findByPk(id, { include: [{ model: Role, as: 'role' }] });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const hashedPassword = password ? await bcrypt.hash(password, 10) : user.password;

        if (profile_image && user.profile_image) {
            const oldImagePath = path.join(__dirname, '../uploads', user.profile_image);
            if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
        }

        let role = roleId ? await Role.findByPk(roleId) : user.role;
        if (!role) return res.status(400).json({ message: 'Invalid roleId' });

        let updateData = {
            name: full_name || user.name,
            email: email || user.email,
            password: hashedPassword,
            roleId: role.id,
            phone: phone || user.phone,
            profile_image: profile_image || user.profile_image,
            status: status || user.status
        };

        if (role.name !== 'admin' && role.name !== 'superadmin') {
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