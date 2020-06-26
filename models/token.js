module.exports = (sequelize, DataTypes) => {
  return sequelize.define('token', {
    token: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  })
}