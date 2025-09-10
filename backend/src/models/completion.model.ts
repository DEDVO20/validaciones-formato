import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";
import { User } from "./user.model";
import { Format } from "./formats.model";

export class Completion extends Model {
  public id!: number;
  public usuarioId!: number;
  public formatId!: number;
  public datos!: object; // valores diligenciados
  public estado!: "pendiente" | "aprobado" | "rechazado";
  public createdAt!: Date;
  public updatedAt!: Date;
}

Completion.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    usuarioId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    formatId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'formats',
        key: 'id'
      }
    },
    datos: { type: DataTypes.JSON, allowNull: false },
    estado: {
      type: DataTypes.ENUM("pendiente", "aprobado", "rechazado"),
      defaultValue: "pendiente",
    },
  },
  { tableName: "completions", sequelize, timestamps: true }
);

// Relaciones
User.hasMany(Completion, { foreignKey: "usuarioId" });
Completion.belongsTo(User, { foreignKey: "usuarioId" });

Format.hasMany(Completion, { foreignKey: "formatId" });
Completion.belongsTo(Format, { foreignKey: "formatId" });
