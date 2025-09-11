// middleware/checkPermission.js
const { UserRole, RolePermission, Permission } = require('../models');

function checkPermission(requiredPermission) {
    return async function (req, res, next) {
        try {
            const userId = req.user?.id;
            const hotelId = req.user?.hotelId;
            const topLevelRole = req.user?.role; // 'superadmin' | 'admin' | 'user'

            if (!userId) {
                return res.status(401).json({ message: 'Unauthorized' });
            }

            // Super admins bypass all checks
            if (topLevelRole === 'superadmin') {
                return next();
            }

            if (!hotelId) {
                return res.status(400).json({ message: 'Hotel context required' });
            }

            // Find roles for this user in the current hotel
            const userRoles = await UserRole.findAll({
                where: { userId, hotelId },
                attributes: ['roleId']
            });

            if (!userRoles.length) {
                return res.status(403).json({ message: 'No role assigned for this hotel' });
            }

            const roleIds = userRoles.map(r => r.roleId);

            // Collect permissions across roles
            const rolePermissions = await RolePermission.findAll({
                where: { roleId: roleIds },
                include: [{ model: Permission, as: 'permission' }]
            });

            // If include alias didn't resolve, fallback query to permissions list
            let permissionNames;
            if (rolePermissions.length && rolePermissions[0].permission) {
                permissionNames = rolePermissions.map(rp => rp.permission.name);
            } else {
                const directPermissions = await Permission.findAll({
                    include: [
                        {
                            association: 'roles',
                            where: { id: roleIds },
                            attributes: []
                        }
                    ],
                    attributes: ['name']
                });
                permissionNames = directPermissions.map(p => p.name);
            }

            if (!permissionNames.includes(requiredPermission)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            return next();
        } catch (err) {
            console.error('checkPermission error:', err);
            return res.status(500).json({ message: 'Server error' });
        }
    };
}

module.exports = checkPermission;
