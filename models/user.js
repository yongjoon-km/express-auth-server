module.exports = (sequelize, DataTypes) => {
  return sequelize.define('user', {
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: false,
    }
  })
}