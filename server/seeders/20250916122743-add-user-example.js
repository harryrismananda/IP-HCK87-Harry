"use strict";

const { hashPassword } = require('../helpers/bcrypt');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = [
      {
        email: "admin@admin.com",
        password: "admin123",
        fullName: "Admin User",
        role: "admin",
        isPremium: true,
      },
      {
        email: "user@user.com",
        password: "user123",
        fullName: "Regular User",
        role: "student",
        isPremium: false,
      },
    ];
    const users = data.map((el) => {
      el.password = hashPassword(el.password);
      el.createdAt = el.updatedAt = new Date();
      return el;
    });

    await queryInterface.bulkInsert("Users", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
