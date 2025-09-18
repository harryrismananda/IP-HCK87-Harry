'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add unique constraint to UserId in Profiles table
    await queryInterface.addConstraint('Profiles', {
      fields: ['UserId'],
      type: 'unique',
      name: 'unique_profile_userid'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the unique constraint
    await queryInterface.removeConstraint('Profiles', 'unique_profile_userid');
  }
};