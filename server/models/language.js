'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Language extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     Language.hasMany(models.Course, { foreignKey: "languageId" });
      Language.hasMany(models.UserProgress, { foreignKey: "languageId" });
    }
  }
  Language.init({
    name: {type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Language name is required" },
        notNull: { msg: "Language name is required" },
    }

  }
}, {
    sequelize,
    modelName: 'Language',
  });
  return Language;
};