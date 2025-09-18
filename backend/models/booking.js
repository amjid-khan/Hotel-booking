'use strict';
module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    hotelId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    guestName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    guestEmail: {
      type: DataTypes.STRING,
      allowNull: false
    },
    guestPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    checkIn: {
      type: DataTypes.DATE,
      allowNull: false
    },
    checkOut: {
      type: DataTypes.DATE,
      allowNull: false
    },
    guests: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    }
  }, {});

  Booking.associate = function (models) {
    Booking.belongsTo(models.Hotel, { foreignKey: 'hotelId' });
    Booking.belongsTo(models.Room, { foreignKey: 'roomId' });
  };

  return Booking;
};
