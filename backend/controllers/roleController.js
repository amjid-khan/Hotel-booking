const { Role, Permission, RolePermission } = require("../models");
const { Op } = require("sequelize");

// Create new role + assign permissions
exports.createRole = async (req, res) => {
    try {
        const { name, permissionIds, permissionNames, hotelId } = req.body; // accepts IDs or names

        if (!name) {
            return res.status(400).json({ message: "Role name is required" });
        }

        // Create role with optional hotel scope
        const role = await Role.create({ name, hotelId: hotelId || null });

        // Assign permissions (accept both IDs and names)
        let resolvedPermissionIds = [];
        if (Array.isArray(permissionIds) && permissionIds.length > 0) {
            // Numeric or numeric-like values
            resolvedPermissionIds = permissionIds.map((p) => Number(p)).filter((n) => !Number.isNaN(n));
        } else if (Array.isArray(permissionNames) && permissionNames.length > 0) {
            const perms = await Permission.findAll({ where: { name: { [Op.in]: permissionNames } } });
            resolvedPermissionIds = perms.map((p) => p.id);
        }

        if (resolvedPermissionIds.length > 0) {
            const rolePermissions = resolvedPermissionIds.map((permissionId) => ({ roleId: role.id, permissionId }));
            await RolePermission.bulkCreate(rolePermissions);
        }

        // Fetch role with permissions
        const roleWithPermissions = await Role.findByPk(role.id, {
            include: [
                { model: Permission, as: "permissions" },
            ],
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
        const { hotelId } = req.query;
        const where = {};
        if (hotelId) {
            // Return roles that are global (hotelId null) or scoped to this hotel
            where["hotelId"] = { [Op.or]: [null, Number(hotelId)] };
        }
        const roles = await Role.findAll({
            where,
            include: { model: Permission, as: "permissions" },
        });
        res.json(roles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update role name and permissions
exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, permissionIds, hotelId } = req.body;

        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ message: "Role not found" });

        if (typeof name === 'string' && name.trim().length > 0) {
            role.name = name.trim();
        }
        if (hotelId !== undefined) {
            role.hotelId = hotelId || null;
        }
        await role.save();

        if (Array.isArray(permissionIds)) {
            // Replace permissions via RolePermission join table
            await RolePermission.destroy({ where: { roleId: role.id } });
            const rows = permissionIds.map(permissionId => ({ roleId: role.id, permissionId }));
            if (rows.length > 0) await RolePermission.bulkCreate(rows);
        }

        const updated = await Role.findByPk(role.id, {
            include: [{ model: Permission, as: 'permissions' }]
        });

        res.json({ message: 'Role updated successfully', role: updated });
    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete role and its permission mappings
exports.deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findByPk(id);
        if (!role) return res.status(404).json({ message: "Role not found" });

        await RolePermission.destroy({ where: { roleId: id } });
        await role.destroy();
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        console.error("Error deleting role:", error);
        res.status(500).json({ message: "Server error" });
    }
};