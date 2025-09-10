import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/db";

export class Format extends Model {
  public id!: number;
  public titulo!: string;
  public estado!: "activo" | "inactivo";
  public contenido!: string; // texto con variables
  public variables!: any; // JSON object con las variables
  public createdAt!: Date;
  public updatedAt!: Date;
}

Format.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    titulo: { type: DataTypes.STRING, allowNull: false },
    estado: {
      type: DataTypes.ENUM("activo", "inactivo"),
      defaultValue: "activo",
    },
    contenido: { type: DataTypes.TEXT, allowNull: false },
    variables: { type: DataTypes.JSON, allowNull: true }, // [{nombre:"fecha", tipo:"date"}]
  },
  { tableName: "formats", sequelize, timestamps: true }
);
