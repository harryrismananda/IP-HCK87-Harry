const { GoogleGenAI } = require("@google/genai");
const { Course, Question, Language } = require("../models");
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
    // console.log("test ini course by id");
    try {
      const { id } = req.params;
      if (isNaN(Number(id))) {
        throw { name: "Bad Request", message: "Invalid course ID format" };
      }
      const course = await Course.findByPk(id, {
        include: [
          {
            model: require("../models").Language,
            attributes: ["id", "name"],
          },
        ],
      });
      if (!course) {
        throw { name: "NotFound", message: "Course not found" };
      }
      res.status(200).json(course);
    } catch (err) {
      next(err);
    }
  }

  static async getCourseByLanguageId(req, res, next) {
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
      // console.log("TEST");
      const { language } = req.body;
      const foundLanguage = await Language.findOne({where: {name: language}})
      const response = await ai.models.generateContent({
        model: "gemini-1.5-pro",
        contents: `
Role: You are a certified ${foundLanguage.name} teacher. 
Instructions: 
1. Create 3 structured courses (1 Beginner, 1 Intermediate, 1 Advanced). 
   Each course must include:
     - "title": Course name,
     - "difficulty": Beginner | Intermediate | Advanced,
     - "languageId": ${foundLanguage.id},
     - "content": {
          "roadmap": High-level learning plan,
          "lessons":[
            { "title": "...", "content": "create in markdown format, not just short text or description but an entire lesson content, content format should be similar compared to this resource https://www.ef.com/wwen/english-resources/english-grammar/noun-gender/", "difficulty": 1|2|3, "order": 1|2|3... },]
       }
2. For each course, generate 5 multiple-choice questions.
   Each question must include:
     - "questionName"
     - "choices": {A: "...", B: "...", C: "...", D: "..."}
     - "answer": correct option (A/B/C/D)
   Ensure questions cover the subtopics of the course.
   Do not return null or empty values.
3. Format Output: Return ONLY JSON in this format:
   {
     "courses": [ {course1}, {course2}, {course3} ]
   }
4. Ensure the JSON is valid and parsable.
5. Fill all the checklist before generating the output:
        [ ] Total count of courses generated = 3?
        [ ] Courses has different difficulties?
        [ ] Total questions generated = 5 for each courses?
        [ ] Courses generated has no null value?
        [ ] Questions generated has no null value?
        [ ] Courses generated has valid JSON format with strict equality?
        [ ] Questions generated has valid JSON format with strict equality?
        [ ] Course content is in markdown format?
        [ ] Course content format is similar to the example resource, not just a single one liner description?
6. If there is ONE checklist from instruction no. 5 that is not filled, re-iterate until everything is filled (IMPORTANT!)
        `,
      });
      const clean = response.text.replace(/```json|```/g, "").trim();
      const parsedResponse = JSON.parse(clean);
      // console.log(parsedResponse.course);
      const data = parsedResponse
      // console.log(data);
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

      res
        .status(201)
        .json({ message: "Courses and questions generated successfully" });
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
