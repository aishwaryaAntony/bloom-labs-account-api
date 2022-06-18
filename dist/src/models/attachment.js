'use strict';

const { Model } = require('sequelize');
/**
 * @swagger
 * definitions:
 *   Attachment:
 *     type: object
 *     required:
 *       - id
 *       - member_id
 *       - storage_key
 *       - status
 *     properties:
 *       id:
 *         type: number
 *       member_id:
 *         type: number
 *       storage_key:
 *         type: string
 *       file_type:
 *         type: string
 *       attachment_type:
 *         type: string
 *       status:
 *         type: string
 *     example:
 *        id: 1
 *        member_id: 1
 *        storage_key: "filename"
 *        file_type: "user"
 *        attachment_type: "jpg"
 *        status: "ACTIVE"
 */
module.exports = (sequelize, DataTypes) => {
  class Attachment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // associations can be defined here
      Attachment.belongsTo(models.Member, { as: 'member', foreignKey: 'member_id', targetKey: 'id' });
    }
  };
  Attachment.init({
    member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Members',
        key: 'id'
      }
    },
    storage_key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    attachment_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Attachment'
  });
  return Attachment;
};