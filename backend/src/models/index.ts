import { sequelize } from "../config/db";
import { User } from "./user.model";
import { Format } from "./formats.model";
import { Completion } from "./completion.model";
import { Validacion } from "./validacion.model";
import { Notification } from "./notification.model";

// Exportar todos los modelos
export { User, Format, Completion, Validacion, Notification };

// Función para sincronizar todos los modelos
export const syncModels = async () => {
  try {
    // Sincronizar todos los modelos con la base de datos sin alterar estructura existente
    await sequelize.sync({ force: false, alter: false });
    console.log("✅ Modelos sincronizados con la base de datos");
  } catch (error) {
    console.error("❌ Error sincronizando modelos:", error);
    throw error;
  }
};