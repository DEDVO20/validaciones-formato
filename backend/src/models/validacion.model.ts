import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";
import { User } from "./user.model";
import { Completion } from "./completion.model";

export class Validacion extends Model {
  public id!: number;
  public completionId!: number;
  public validadorId!: number;
  public estado!: "pendiente" | "aprobado" | "rechazado";
  public observaciones?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Validacion.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    completionId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'completions',
        key: 'id'
      }
    },
    validadorId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    estado: {
      type: DataTypes.ENUM("pendiente", "aprobado", "rechazado"),
      defaultValue: "pendiente",
    },
    observaciones: { type: DataTypes.TEXT, allowNull: true },
  },
  { tableName: "validaciones", sequelize, timestamps: true }
);

// Relaciones
Completion.hasOne(Validacion, { foreignKey: "completionId" });
Validacion.belongsTo(Completion, { foreignKey: "completionId" });

User.hasMany(Validacion, { foreignKey: "validadorId" });
Validacion.belongsTo(User, { foreignKey: "validadorId", as: "Validador" });
