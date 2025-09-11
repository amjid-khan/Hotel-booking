'use strict';
module.exports = (sequelize, DataTypes) => {
    const RolePermission = sequelize.define('RolePermission', {
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'role_id',
            references: { model: 'roles', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        permissionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'permission_id',
            references: { model: 'permissions', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    }, {
        tableName: 'role_permissions',
        underscored: false,
        timestamps: false
    });
    RolePermission.associate = function(models) {
        RolePermission.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' });
        RolePermission.belongsTo(models.Permission, { foreignKey: 'permissionId', as: 'permission' });
    };
    return RolePermission;
};


