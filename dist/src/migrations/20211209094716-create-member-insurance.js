'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('MemberInsurances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      member_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Members',
          key: 'id'
        }
      },
      insurance_provider: {
        allowNull: false,
        type: Sequelize.STRING
      },
      policy_number: {
        allowNull: false,
        type: Sequelize.STRING
      },
      policy_group_number: {
        allowNull: true,
        type: Sequelize.STRING
      },
      provider_phone_number: {
        allowNull: true,
        type: Sequelize.STRING
      },
      front_insurance_card_image: {
        allowNull: true,
        type: Sequelize.STRING
      },
      back_insurance_card_image: {
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
      expiry_date: {
        allowNull: true,
        type: Sequelize.DATE
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
      queryInterface.addIndex("MemberInsurances", ["member_id"]);
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MemberInsurances');
  }
};