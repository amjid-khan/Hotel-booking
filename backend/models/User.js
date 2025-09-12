'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: { type: DataTypes.STRING(100), allowNull: false },
        email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
        password: { type: DataTypes.STRING(255), allowNull: false },
        hotelId: { type: DataTypes.INTEGER, references: { model: 'hotels', key: 'id' } },
        roleId: { type: DataTypes.INTEGER, references: { model: 'roles', key: 'id' } }, // FK to roles
        phone: DataTypes.STRING(20),
        profile_image: DataTypes.STRING(255),
        status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
    }, {
        tableName: 'users',
        underscored: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    User.associate = function (models) {
        User.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
        User.belongsTo(models.Role, { foreignKey: 'roleId', as: 'role' }); // direct association to Role
    };

    return User;
};
