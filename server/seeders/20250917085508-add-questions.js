'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const data = [
        {
          "questionName": "Which letter is a vowel?",
          "courseId": 1,
          "choices": JSON.stringify({
            "A": "B",
            "B": "F",
            "C": "I",
            "D": "T"
          }),
          "answer": "C"
        },
        {
          "questionName": "What is the correct greeting for the early afternoon?",
          "courseId": 1,
          "choices": JSON.stringify({
            "A": "Good night",
            "B": "Good morning",
            "C": "Good afternoon",
            "D": "Good evening"
          }),
          "answer": "C"
        },
        {
          "questionName": "How do you say the number '5' in English?",
          "courseId": 1,
          "choices": JSON.stringify({
            "A": "Four",
            "B": "Five",
            "C": "Six",
            "D": "Ten"
          }),
          "answer": "B"
        },
        {
          "questionName": "Which article should you use before the word 'elephant'?",
          "courseId": 1,
          "choices":  JSON.stringify({
            "A": "A",
            "B": "An",
            "C": "The",
            "D": "No article"
          }),
          "answer": "B"
        },
        {
          "questionName": "Complete the sentence: 'He ___ a doctor.'",
          "courseId": 1,
          "choices": JSON.stringify({
            "A": "am",
            "B": "are",
            "C": "is",
            "D": "be"
          }),
          "answer": "C"
        }
      ]
      const query = data.map(el => {
        el.createdAt = el.updatedAt = new Date()
        return el
      });
      await queryInterface.bulkInsert('Questions', query, {});
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Questions', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
