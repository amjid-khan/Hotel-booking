'use strict';
module.exports = (sequelize, DataTypes) => {
    const Room = sequelize.define('Room', {
        roomNumber: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        type: DataTypes.STRING(50),
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        image: DataTypes.STRING(255),
        capacity: DataTypes.INTEGER,
        description: DataTypes.TEXT,
        hotelId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'hotels',
                key: 'id'
            }
        },
        isAvailable: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'rooms',
        underscored: false,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    });

    Room.associate = function (models) {
        Room.belongsTo(models.Hotel, { foreignKey: 'hotelId', as: 'hotel' });
    };

    return Room;
};