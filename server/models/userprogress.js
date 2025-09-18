'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserProgress extends Model {

    static associate(models) {
      UserProgress.belongsTo(models.User, { foreignKey: "userId" });
      UserProgress.belongsTo(models.Language, { foreignKey: "languageId" });  
      // define association here
    }
  }
  UserProgress.init({
    userId: DataTypes.INTEGER,
    languageId: DataTypes.INTEGER,
    progress: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'UserProgress',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'languageId'],
        name: 'unique_user_language_progress'
      }
    ]
  });
  return UserProgress;
};