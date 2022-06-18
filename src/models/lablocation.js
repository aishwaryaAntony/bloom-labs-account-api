'use strict';
const { Model } = require('sequelize');
/**
 * @swagger
 * definitions:
 *   LabLocation:
 *     type: object
 *     required:
 *       - id
 *       - lab_id
 *       - lab_token
 *       - name
 *       - lab_name
 *       - status
 *     properties:
 *       id:
 *         type: number
 *       lab_id:
 *         type: number
 *       lab_token:
 *         type: string
 *       name:
 *         type: string
 *       lab_name:
 *         type: string
 *       clia:
 *         type: string
 *       street_address_line1:
 *         type: string
 *       street_address_line2:
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
 *       timezone:
 *         type: string
 *       ordering_facility:
 *         type: string
 *       acuity_ref:
 *         type: string
 *       status:
 *         type: string
 *     example:
 *        id: 1
 *        lab_token: "fdf546dhg57gh57yhf"
 *        lab_id: 1
 *        name: "Kenla"
 *        lab_name: "lab name"
 *        clia: "clia"
 *        street_address_line1: "Kenla"
 *        street_address_line2: "Adayar"
 *        phone_number: "1234567890"
 *        city: "Chennai"
 *        state: "TamilNadu"
 *        country: "India"
 *        zipcode: "600020"
 *        timezone: "New York"
 *        ordering_facility: "Yes"
 *        acuity_ref: "34564"
 *        status: "ACTIVE"
 */
module.exports = (sequelize, DataTypes) => {
  class LabLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // associations can be defined here
      LabLocation.belongsTo(models.Lab, { as: 'location', foreignKey: 'lab_id', targetKey: 'id' });
    }
  };
  LabLocation.init({
    lab_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
			references: {
				model: 'Labs',
				key: 'id'
			}
    },
    lab_code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code:{
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lab_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    clia: {
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
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ordering_facility: {
      type: DataTypes.STRING,
      allowNull: true
    },
    acuity_ref: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'LabLocation',
  });
  return LabLocation;
};