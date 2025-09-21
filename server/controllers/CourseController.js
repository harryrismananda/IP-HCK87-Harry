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
# Language Course Generation Prompt

You are a certified ${foundLanguage.name} teacher tasked with creating comprehensive language courses.

## Task Requirements

Create exactly 3 structured courses with the following specifications:

### Course Structure
Each course MUST contain:
- **title**: Descriptive course name
- **difficulty**: One of "Beginner", "Intermediate", or "Advanced"
- **languageId**: ${foundLanguage.id}
- **content**: Object containing:
  - **roadmap**: Detailed 3-4 sentence learning plan overview
  - **lessons**: Array of lesson objects, each with:
    - **title**: Lesson name
    - **content**: Complete lesson in markdown format (minimum 500 words, structured like https://www.ef.com/wwen/english-resources/english-grammar/noun-gender/ with explanations, examples, and practice)
    - **difficulty**: Numeric value (1 for Beginner, 2 for Intermediate, 3 for Advanced)
    - **order**: Sequential lesson number (1, 2, 3, etc.)

### Question Structure
For each course, create exactly 5 multiple-choice questions:
- **questionName**: Clear question text
- **choices**: Object with keys A, B, C, D and corresponding answer options
- **answer**: Single letter (A, B, C, or D) indicating correct answer

## Content Guidelines

1. **Lesson Content Requirements**:
   - Write in markdown format with proper headers, lists, and formatting
   - Include detailed explanations with multiple examples
   - Provide context and usage scenarios
   - Add practice exercises or example sentences
   - Minimum 500 words per lesson
   - Structure similar to professional language learning resources

2. **Course Progression**:
   - Beginner: 3-4 lessons covering fundamentals
   - Intermediate: 4-5 lessons building on basics
   - Advanced: 4-5 lessons with complex concepts

3. **Questions**:
   - Cover different aspects of each course
   - Test comprehension, application, and analysis
   - Vary in difficulty appropriate to course level
   - Include distractors that are plausible but incorrect

## Output Format

Return ONLY valid JSON in this exact structure:

json
{
  "courses": [
    {
      "title": "Course Title",
      "difficulty": "Beginner",
      "languageId": ${foundLanguage.id},
      "content": {
        "roadmap": "Comprehensive learning plan description...",
        "lessons": [
          {
            "title": "Lesson Title",
            "content": "# Lesson Title\n\nDetailed markdown content...",
            "difficulty": 1,
            "order": 1
          }
        ]
      },
      "questions": [
        {
          "questionName": "Question text?",
          "choices": {
            "A": "Option A",
            "B": "Option B", 
            "C": "Option C",
            "D": "Option D"
          },
          "answer": "A"
        }
      ]
    }
  ]
}


## Quality Checklist

Before submitting, verify:
- [ ] Exactly 3 courses generated
- [ ] One course each: Beginner, Intermediate, Advanced
- [ ] Each course has exactly 5 questions
- [ ] No null, undefined, or empty values anywhere
- [ ] All lesson content is substantial markdown (500+ words)
- [ ] JSON is valid and properly formatted
- [ ] All required fields are present
- [ ] Questions test course material comprehensively
- [ ] Content is educationally sound and progressive

## Important Notes

- Focus on creating high-quality, educational content
- Ensure JSON syntax is perfect (no trailing commas, proper quotes)
- Make lessons comprehensive and engaging
- Questions should genuinely test understanding
- All content must be complete - no placeholders or abbreviated sections

Generate the complete course structure now.
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
