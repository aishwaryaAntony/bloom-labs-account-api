'use strict';
const {
  Model
} = require('sequelize');
/**
 * @swagger
 * definitions:
 *   AccountRole:
 *     type: object
 *     required:
 *       - id
 *       - code
 *       - name
 *       - view
 *       - add
 *       - edit
 *       - delete
 *       - status
 *     properties:
 *       id:
 *         type: number
 *       code:
 *         type: string
 *       name:
 *         type: string
 *       view:
 *         type: boolean
 *       add:
 *         type: boolean
*       edit:
 *         type: boolean
 *       delete:
 *         type: boolean
 *       status:
 *         type: string
 *     example:
 *        id: 1
 *        name: Permission Screen
 *        view: true
 *        add: true
 *        edit: true
 *        delete: true
 *        status: "ACTIVE"
 */
module.exports = (sequelize, DataTypes) => {
  class ScreenPermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  ScreenPermission.init({
    code:{
      type: DataTypes.STRING,
      allowNull: false
    },
    name:{
      type: DataTypes.STRING,
      allowNull: false
    },
    status:{
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ScreenPermission',
  });
  return ScreenPermission;
};