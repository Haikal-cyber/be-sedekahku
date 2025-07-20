'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Campaign extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Campaign.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    target_amount: DataTypes.DECIMAL,
    current_amount: DataTypes.DECIMAL,
    image_url: DataTypes.STRING,
    category: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('active', 'completed', 'pending')
    },
    user_id: DataTypes.UUID,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Campaign',
    timestamps: false,
    tableName: 'Campaigns'
  });
  return Campaign;
};