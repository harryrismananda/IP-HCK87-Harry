'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add unique constraint on userId and languageId combination
    await queryInterface.addConstraint('UserProgresses', {
      fields: ['userId', 'languageId'],
      type: 'unique',
      name: 'unique_user_language_progress'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint
    await queryInterface.removeConstraint('UserProgresses', 'unique_user_language_progress');
  }
};