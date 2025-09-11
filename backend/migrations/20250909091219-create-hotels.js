'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('hotels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING(255)
      },
      description: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      city: {
        type: Sequelize.STRING(100)
      },
      state: {
        type: Sequelize.STRING(100)
      },
      country: {
        type: Sequelize.STRING(100)
      },
      zip: {
        type: Sequelize.STRING(20)
      },
      phone: {
        type: Sequelize.STRING(30)
      },
      email: {
        type: Sequelize.STRING(100)
      },
      starRating: {
        type: Sequelize.INTEGER
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('hotels');
  }
};