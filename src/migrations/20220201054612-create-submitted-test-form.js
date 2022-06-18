'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SubmittedTestForms', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      member_token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      form_detail: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      submitted_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      submitted_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(function(){
      queryInterface.addIndex('SubmittedTestForms', ['submitted_date'])
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SubmittedTestForms');
  }
};