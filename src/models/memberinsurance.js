'use strict';
const { Model } = require('sequelize');
/**
 * @swagger
 * definitions:
 *   MemberInsurance:
 *     type: object
 *     required:
 *       - id
 *       - member_id
 *       - insurance_provider
 *       - policy_number
 *     properties:
 *       id:
 *         type: number
 *       member_id:
 *         type: number
 *       insurance_provider:
 *         type: string
 *       policy_number:
 *         type: string
 *       policy_group_number:
 *         type: string
 *       provider_phone_number:
 *         type: string
 *       front_insurance_card_image:
 *         type: string
 *       back_insurance_card_image:
 *         type: string
 *       street_address_line1:
 *         type: string
 *       street_address_line2:
 *         type: string
 *       city:
 *         type: string
 *       state:
 *         type: string
 *       country:
 *         type: string
 *       zipcode:
 *         type: string
 *       expiry_date:
 *         type: string
 *       status:
 *         type: string
 *     example:
 *        id: 1
 *        member_id: 1
 *        insurance_provider: "ICICI"
 *        policy_number: "678"
 *        policy_group_number: "768"
 *        provider_phone_number: "1234567890"
 *        front_insurance_card_image: "filename"
 *        back_insurance_card_image: "filename"
 *        street_address_line1: "Kenla"
 *        street_address_line2: "Adayar"
 *        city: "Chennai"
 *        state: "TamilNadu"
 *        country: "India"
 *        zipcode: "600020"
 *        expiry_date: "2021-12-21"
 *        status: "ACTIVE"
 */
module.exports = (sequelize, DataTypes) => {
  class MemberInsurance extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // associations can be defined here
      MemberInsurance.belongsTo(models.Member, { as: 'member', foreignKey: 'member_id', targetKey: 'id' });
    }
  };
  MemberInsurance.init({
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Members',
        key: 'id'
      }
    },
    insurance_provider: {
      type: DataTypes.STRING,
      allowNull: false
    },
    policy_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    policy_group_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    provider_phone_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    front_insurance_card_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    back_insurance_card_image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    street_address_line1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    street_address_line2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expiry_date: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'MemberInsurance',
  });
  return MemberInsurance;
};