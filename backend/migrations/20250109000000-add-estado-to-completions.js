"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("completions", "estado", {
      type: Sequelize.ENUM("pendiente", "aprobado", "rechazado"),
      allowNull: false,
      defaultValue: "pendiente",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("completions", "estado");
  },
};