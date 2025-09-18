import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";

interface FormatSubmissionAttributes {
  id: number;
  formatId: number;
  userId: number;
  data: object;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  createdAt?: Date;
  updatedAt?: Date;
}

interface FormatSubmissionCreationAttributes extends Optional<FormatSubmissionAttributes, 'id'> {}

class FormatSubmission extends Model<FormatSubmissionAttributes, FormatSubmissionCreationAttributes> 
  implements FormatSubmissionAttributes {
  public id!: number;
  public formatId!: number;
  public userId!: number;
  public data!: object;
  public status!: 'pendiente' | 'aprobado' | 'rechazado';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

FormatSubmission.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    formatId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'formats',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
  },
  {
    sequelize,
    modelName: 'FormatSubmission',
    tableName: 'format_submissions',
    timestamps: true,
  }
);

export { FormatSubmission };