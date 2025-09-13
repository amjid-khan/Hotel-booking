const { Role, Permission, RolePermission } = require("../models");

// Create new role + assign permissions
exports.createRole = async (req, res) => {
    try {
        const { name, permissionIds } = req.body; // permissionIds = [1,2,3]

        if (!name) {
            return res.status(400).json({ message: "Role name is required" });
        }

        // Create role
        const role = await Role.create({ name });

        // Assign permissions manually in role_permissions table
        if (permissionIds && Array.isArray(permissionIds)) {
            const rolePermissions = permissionIds.map(permissionId => ({
                roleId: role.id,
                permissionId,
            }));

            await RolePermission.bulkCreate(rolePermissions);
        }

        // Fetch role with permissions
        const roleWithPermissions = await Role.findByPk(role.id, {
            include: { model: Permission, as: "permissions" },
        });

        res.status(201).json({
            message: "Role created successfully",
            role: roleWithPermissions,
        });
    } catch (error) {
        console.error("Error creating role:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all roles with permissions
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.findAll({
            include: { model: Permission, as: "permissions" },
        });
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
