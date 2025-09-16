const { Course } = require("../models");
class CourseController { 
  static async getAllCourses(req, res, next) {
    try {
      const courses = await Course.findAll();
      res.status(200).json(courses);
    } catch (err) {
      next(err);
    }
  } 
  static async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      const course = await Course.findByPk(id);
      if (!course) {
        throw { name: "NotFound", message: "Course not found" };
      }
      res.status(200).json(course);
    } catch (err) {
      next(err);
    }
  }   
  static async createCourse(req, res, next) {
    try {
      const { title, description, languageId } = req.body;
      const newCourse = await Course.create({ title, description, languageId });
      res.status(201).json(newCourse);
    } catch (err) {
      next(err);
    } 
  } 

  static async updateCourse(req, res, next) {
    try {
      const { id } = req.params;   
      const { title, description, languageId } = req.body;
      const course = await Course.findByPk(id); 
      if (!course) {
        throw { name: "NotFound", message: "Course not found" };
      } 
      course.title = title;
      course.description = description;
      course.languageId = languageId;
      await course.save();
      res.status(200).json(course);
    } catch (err) {
      next(err);
    }
  }

  static async deleteCourse(req, res, next) {
    try {
      const { id } = req.params;  
      const course = await Course.findByPk(id);
      if (!course) {
        throw { name: "NotFound", message: "Course not found" };
      }
      await course.destroy();
      res.status(204).json();
    } catch (err) {
      next(err);
    }
  } 
}

module.exports = CourseController;