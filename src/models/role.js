'use strict';
const { Model } = require('sequelize');
/**
 * @swagger
 * definitions:
 *   Role:
 *     type: object
 *     required:
 *       - id
 *       - code
 *       - name
 *       - status
 *     properties:
 *       id:
 *         type: number
 *       code:
 *         type: string
 *       name:
 *         type: string
 *       permission:
 *         type: json
 *       status:
 *         type: string
 *     example:
 *        id: 1
 *        code: "ADM"
 *        name: "Admin"
 *        permission: {}
 *        status: "ACTIVE"
 */
module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // associations can be defined here
      Role.hasMany(models.AccountRole, { as: 'accountRoles', foreignKey: 'role_id', sourceKey: 'id' });
    }
  };
  Role.init({
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    permission:{
			type: DataTypes.JSONB,
			allowNull: true
		},
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Role',
  });
  return Role;
};