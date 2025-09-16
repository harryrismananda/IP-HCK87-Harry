const { Question } = require("../models");
module.exports = class QuestionController {
  static async getAllQuestions(req, res, next) {
    try {
      const questions = await Question.findAll();
      res.status(200).json(questions);
    } catch (err) {
      next(err);
    } 
  }
  static async getQuestionById(req, res, next) {
    try {
      const { id } = req.params;  
      const question = await Question.findByPk(id);
      if (!question) {
        throw { name: "NotFound", message: "Question not found" };
      }
      res.status(200).json(question);
    } catch (err) {
      next(err);
    }
  }
  static async createQuestion(req, res, next) {
    try {
      const { text, answer, courseId } = req.body;  
      const newQuestion = await Question.create({ text, answer, courseId });
      res.status(201).json(newQuestion);
    } catch (err) {
      next(err);
    }
  }
  static async updateQuestion(req, res, next) {
    try {
      const { id } = req.params;  
      const { text, answer, courseId } = req.body;
      const question = await Question.findByPk(id); 
      if (!question) {
        throw { name: "NotFound", message: "Question not found" };
      } 
      question.text = text;
      question.answer = answer;
      question.courseId = courseId;
      await question.save();
      res.status(200).json(question);
    } catch (err) {
      next(err);
    } 
  }
  static async deleteQuestion(req, res, next) {
    try {
      const { id } = req.params;  
      const question = await Question.findByPk(id); 
      if (!question) {
        throw { name: "NotFound", message: "Question not found" };
      }
      await question.destroy();
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
};