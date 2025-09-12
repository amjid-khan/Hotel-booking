'use strict';
module.exports = (sequelize, DataTypes) => {
    const Hotel = sequelize.define('Hotel', {
        adminId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'admin_id'
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        address: DataTypes.STRING,
        description: DataTypes.TEXT,
        city: DataTypes.STRING(100),
        state: DataTypes.STRING(100),
        country: DataTypes.STRING(100),
        zip: DataTypes.STRING(20),
        phone: DataTypes.STRING(30),
        email: DataTypes.STRING(100),
        starRating: {
            type: DataTypes.INTEGER,
            field: 'starRating'
        }
    }, {
        tableName: 'hotels',
        underscored: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: false // If you don't have updated_at
    });
    // associations are defined in Hotel.associate below
    Hotel.associate = function (models) {
        Hotel.belongsTo(models.User, { as: 'admin', foreignKey: 'adminId' });
        Hotel.hasMany(models.Room, { foreignKey: 'hotelId' });
        // Hotel.hasMany(models.Role, { foreignKey: 'hotelId', as: 'roles' });
    };
    return Hotel;
};