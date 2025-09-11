'use strict';
module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255)
        },
        hotelId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'hotel_id',
            references: {
                model: 'hotels',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    }, {
        tableName: 'roles',
        underscored: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Role.associate = function (models) {
        Role.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
        Role.belongsToMany(models.Permission, {
            through: models.RolePermission,
            foreignKey: 'roleId',
            otherKey: 'permissionId',
            as: 'permissions'
        });
        Role.belongsToMany(models.User, {
            through: models.UserRole,
            foreignKey: 'roleId',
            otherKey: 'userId',
            as: 'users'
        });
    };

    return Role;
};



