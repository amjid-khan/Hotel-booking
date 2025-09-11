'use strict';
module.exports = (sequelize, DataTypes) => {
    const UserRole = sequelize.define('UserRole', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'user_id',
            references: { model: 'users', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'role_id',
            references: { model: 'roles', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        hotelId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'hotel_id',
            references: { model: 'hotels', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    }, {
        tableName: 'user_roles',
        underscored: false,
        timestamps: false
    });

    return UserRole;
};


