import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";
import { Format } from "./formats.model";
import { User } from "./user.model";

export const FormatSubmission = sequelize.define("formatSubmission", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  usuarioId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  formatoId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: Format,
      key: "id",
    },
  },
  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM("pendiente", "aprobado", "rechazado"),
    allowNull: false,
    defaultValue: "pendiente",
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, 
{
  timestamps: true,
  tableName: "FormatSubmissions",
});

//Relaciones
FormatSubmission.belongsTo(User, {
  foreignKey: "usuarioId",
  as: "user",
});

FormatSubmission.belongsTo(Format, {
  foreignKey: "formatoId",
  as: "format",
});