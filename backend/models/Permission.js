'use strict';
module.exports = (sequelize, DataTypes) => {
    const Permission = sequelize.define('Permission', {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        action: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        resource: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255)
        }
    }, {
        tableName: 'permissions',
        underscored: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Permission.associate = function (models) {
        Permission.belongsToMany(models.Role, {
            through: models.RolePermission,
            foreignKey: 'permissionId',
            otherKey: 'roleId',
            as: 'roles'
        });
    };

    return Permission;
};



