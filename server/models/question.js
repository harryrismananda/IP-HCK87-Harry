'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Question.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'Course'
      });
    }
  }
  Question.init({
    courseId: DataTypes.INTEGER,
    questionName: DataTypes.STRING,
    choices: DataTypes.JSON,
    answer: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Question',
  });
  return Question;
};