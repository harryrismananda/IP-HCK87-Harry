'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Course.belongsTo(models.Language, { foreignKey: "LanguageId" });
      Course.hasMany(models.Question, { foreignKey: "CourseId" });
    }
  }
  Course.init({
    languageId: DataTypes.UUID,
    title: DataTypes.STRING,
    difficulty: DataTypes.INTEGER,
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};