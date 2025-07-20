'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define associations
db.User.hasMany(db.Campaign, { foreignKey: 'user_id', as: 'campaigns' });
db.Campaign.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.User.hasMany(db.Donation, { foreignKey: 'user_id', as: 'donations' });
db.Donation.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

db.Campaign.hasMany(db.Donation, { foreignKey: 'campaign_id', as: 'donations' });
db.Donation.belongsTo(db.Campaign, { foreignKey: 'campaign_id', as: 'campaign' });

db.Donation.hasMany(db.PaymentNotification, { foreignKey: 'donation_id', as: 'notifications' });
db.PaymentNotification.belongsTo(db.Donation, { foreignKey: 'donation_id', as: 'donation' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
