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
  });
  return UserProgress;
};