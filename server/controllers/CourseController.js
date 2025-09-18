const { GoogleGenAI } = require("@google/genai");
const { Course } = require("../models");
const ai = new GoogleGenAI({});
class CourseController {
  static async getAllCourses(req, res, next) {
    try {
      const courses = await Course.findAll();
      // console.log(courses)
      res.status(200).json(courses);
    } catch (err) {
      next(err);
    }
  }

  static async getCourseById(req, res, next) {
    try {
      const { id } = req.params;
      if (isNaN(Number(id))) {
        throw { name: "Bad Request", message: "Invalid course ID format" };
      }
      const course = await Course.findByPk(id, {
        include: [
          {
            model: require('../models').Language,
            attributes: ['id', 'name']
          }
        ]
      });
      if (!course) {
        throw { name: "NotFound", message: "Course not found" };
      }
      res.status(200).json(course);
    } catch (err) {
      next(err);
    }
  }

  static async getCourseByLanguageId (req, res, next) {
  try {
    const { languageId } = req.params;
    if (isNaN(Number(languageId))) {
      throw { name: "Bad Request", message: "Invalid language ID format" };
    }
    const courses = await Course.findAll({ where: { languageId } });    
    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
  
  }
  
  static async createCourse(req, res, next) {
    try {
      const { language } = req.body;
      const response = await ai.models.generateContent.create({
        model: "gemini-2.5-flash",
        contents: `
Role: You are a certified ${language} teacher. 
Instructions: 
1. Create 9 structured courses (3 Beginner, 3 Intermediate, 3 Advanced). 
   Each course must include:
     - "title": Course name,
     - "difficulty": Beginner | Intermediate | Advanced,
     - "languageId": (1 = English, 2 = Japanese, 3 = Russian),
     - "content": {
          "roadmap": High-level learning plan,
          "lessons":[
            { "title": "...", "content": "create in markdown format", "difficulty": 1|2|3, "order": 1|2|3... },]
       }
2. For each course, generate 5 multiple-choice questions.
   Each question must include:
     - "questionName"
     - "options": {A: "...", B: "...", C: "...", D: "..."}
     - "answer": correct option (A/B/C/D)
   Ensure questions cover the subtopics of the course.
3. Format Output: Return ONLY JSON in this format:
   {
     "courses": [ {course1}, {course2}, {course3} ]
   }
4. Ensure the JSON is valid and parsable.
        `,
      });
      const data = JSON.stringify(response.text);
      for (const course of data.courses) {
        const createdCourse = await Course.create({
          title: course.title,
          difficulty: course.difficulty,
          languageId: course.languageId,
          content: course.content,
        });

        for (const el of course.questions) {
          await Question.create({
            ...el,
            courseId: createdCourse.id, 
          });
        }
      }

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
