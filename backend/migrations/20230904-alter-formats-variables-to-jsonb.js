"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Formats", "variables", {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: [],
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Formats", "variables", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
