'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('AccountLocations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      lab_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Labs',
          key: 'id'
        }
      },
      lab_location_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LabLocations',
          key: 'id'
        }
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Accounts',
          key: 'id'
        }
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false
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
      queryInterface.addIndex("AccountLocations", ["lab_id", "lab_location_id", "account_id"]);
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('AccountLocations');
  }
};