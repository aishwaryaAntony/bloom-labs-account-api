'use strict';

const { Model } = require('sequelize');
/**
 * @swagger
 * definitions:
 *   Lab:
 *     type: object
 *     required:
 *       - id
 *       - lab_token
 *       - code
 *       - name
 *       - status
 *     properties:
 *       id:
 *         type: number
 *       lab_token:
 *         type: string
 *       code:
 *         type: string
 *       name:
 *         type: string
 *       logo:
 *         type: string
 *       description:
 *         type: string
 *       address_line_1:
 *         type: string
 *       address_line_2:
 *         type: string
 *       phone_number:
 *         type: string
 *       city:
 *         type: string
 *       state:
 *         type: string
 *       country:
 *         type: string
 *       zipcode:
 *         type: string
 *       status:
 *         type: string
 *     example:
 *        id: 1
 *        lab_token: "fdf546dhg57gh57yhf"
 *        code: "LL4"
 *        name: "user"
 *        logo: "logo"
 *        description: "Lab Description"
 *        address_line_1: "Kenla"
 *        address_line_2: "Adayar"
 *        phone_number: "1234567890"
 *        city: "Chennai"
 *        state: "TamilNadu"
 *        country: "India"
 *        zipcode: "600020"
 *        status: "ACTIVE"
 */
module.exports = (sequelize, DataTypes) => {
  class Lab extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // associations can be defined here
      Lab.hasMany(models.Account, { as: 'labAccounts', foreignKey: 'lab_ref', sourceKey: 'id' });
      Lab.hasMany(models.LabLocation, { as: 'labLocations', foreignKey: 'lab_id', sourceKey: 'id' });
    }
  };
  Lab.init({
    lab_token: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address_line_1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address_line_2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone_number: {
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
    status: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Lab'
  });
  return Lab;
};