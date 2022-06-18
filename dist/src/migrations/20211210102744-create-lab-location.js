'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LabLocations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      lab_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Labs',
          key: 'id'
        }
      },
      lab_code: {
        allowNull: false,
        type: Sequelize.STRING
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      lab_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      clia: {
        allowNull: true,
        type: Sequelize.STRING
      },
      street_address_line1: {
        allowNull: true,
        type: Sequelize.STRING
      },
      street_address_line2: {
        allowNull: true,
        type: Sequelize.STRING
      },
      city: {
        allowNull: true,
        type: Sequelize.STRING
      },
      state: {
        allowNull: true,
        type: Sequelize.STRING
      },
      country: {
        allowNull: true,
        type: Sequelize.STRING
      },
      zipcode: {
        allowNull: true,
        type: Sequelize.STRING
      },
      phone_number: {
        allowNull: true,
        type: Sequelize.STRING
      },
      timezone: {
        allowNull: true,
        type: Sequelize.STRING
      },
      ordering_facility: {
        allowNull: true,
        type: Sequelize.STRING
      },
      acuity_ref: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function () {
      queryInterface.addIndex("LabLocations", ["lab_id"]);
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LabLocations');
  }
};