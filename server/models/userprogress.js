'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserProgress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserProgress.belongsTo(models.User, { foreignKey: "UserId" });
      UserProgress.belongsTo(models.Language, { foreignKey: "LanguageId" });  
      // define association here
    }
  }
  UserProgress.init({
    userId: DataTypes.UUID,
    languageId: DataTypes.UUID,
    progress: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'UserProgress',
  });
  return UserProgress;
};