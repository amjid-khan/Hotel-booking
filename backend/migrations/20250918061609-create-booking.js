'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      hotelId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Hotels', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      roomId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Rooms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      guestName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      guestEmail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      guestPhone: {
        type: Sequelize.STRING
      },
      checkIn: {
        type: Sequelize.DATE,
        allowNull: false
      },
      checkOut: {
        type: Sequelize.DATE,
        allowNull: false
      },
      guests: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        defaultValue: 'pending'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};
