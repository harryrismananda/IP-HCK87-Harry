'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Profile extends Model {

    static associate(models) {
      Profile.belongsTo(models.User, { foreignKey: "UserId" });
      
    }
  }
  Profile.init({
    UserId: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false
    },
    displayName: DataTypes.STRING,
    profilePicture: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Profile',
  });
  return Profile;
};