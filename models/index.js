'use strict';

const Sequelize = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require('./user')(sequelize, Sequelize)
db.Token = require('./token')(sequelize, Sequelize)

db.User.hasOne(db.Token, { foreignKey: 'id', sourceKey: 'id' })
db.Token.belongsTo(db.User, { foreignKey: 'id', targetKey: 'id' })

module.exports = db;