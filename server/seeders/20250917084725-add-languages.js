'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    const languages = [
      { name: 'English', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Japanese', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Russian', createdAt: new Date(), updatedAt: new Date() },
    ];

    await queryInterface.bulkInsert('Languages', languages, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Languages', null, {});
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
