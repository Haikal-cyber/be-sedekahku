'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Donation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Donation.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: DataTypes.UUID,
    campaign_id: DataTypes.UUID,
    amount: DataTypes.DECIMAL,
    status: {
      type: DataTypes.ENUM('pending', 'paid', 'failed', 'expire')
    },
    donor_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    payment_type: DataTypes.STRING,
    payment_token: DataTypes.STRING,
    redirect_url: DataTypes.STRING,
    paid_at: DataTypes.DATE,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Donation',
    timestamps: false,
    tableName: 'Donations'
  });
  return Donation;
};