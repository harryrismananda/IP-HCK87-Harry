const { Language } = require("../models");

class LanguageController {
  static async getAllLanguages(req, res, next) {
    try {
      const languages = await Language.findAll();
      res.status(200).json(languages);
    } catch (err) {
      next(err);
    }
  }

  static async getLanguageById(req, res, next) {
    try {
      const { id } = req.params;
      if (isNaN(Number(id))) {
        throw { name: "Bad Request", message: "Invalid language ID format" };
      }
      const language = await Language.findByPk(id);
      if (!language) {
        throw { name: "NotFound", message: "Language not found" };
      }
      res.status(200).json(language);
    } catch (err) {
      next(err);
    }
  }

  static async createLanguage(req, res, next) {
    try {
      const { name } = req.body;
      const newLanguage = await Language.create({ name });
      res.status(201).json(newLanguage);
    } catch (err) {
      next(err);
    }
  }

  static async deleteLanguage(req, res, next) {
    try {
      const { id } = req.params;
     if (isNaN(Number(id))) {
        throw { name: "Bad Request", message: "Invalid language ID format" };
      }
      const language = await Language.findByPk(id);
      if (!language) {
        throw { name: "NotFound", message: "Language not found" };
      }
      await language.destroy();
      res.status(204).json();
    } catch (err) {
      next(err);
    }
  }
}

module.exports = LanguageController;
