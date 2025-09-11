import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";
import { User } from "./user.model";

export const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "notifications",
  timestamps: true,
});

// relación
Notification.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Notification, { foreignKey: "userId" });
