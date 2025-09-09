'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('user', 'admin', 'superadmin'),
            allowNull: false,
            defaultValue: 'user'
        },
        hotelId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'hotels',
                key: 'id'
            }
        },
        phone: DataTypes.STRING(20),
        profile_image: DataTypes.STRING(255),
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
    }, {
        tableName: 'users',
        underscored: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    User.associate = function (models) {
        User.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
    };

    return User;
};