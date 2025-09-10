import { sequelize } from "./config/db";
import { User } from "./models/user.model";
import { Format } from "./models/formats.model";
import { Completion } from "./models/completion.model";

const addMoreTestData = async () => {
  try {
    // Buscar el usuario y formato existentes
    const user = await User.findOne({ where: { email: "user@example.com" } });
    const format = await Format.findOne({ where: { titulo: "Formato de Prueba" } });
    
    if (!user || !format) {
      console.log("❌ Usuario o formato no encontrado");
      process.exit(1);
    }

    // Crear más completions sin validaciones (pendientes)
    const completion3 = await Completion.create({
      usuarioId: user.id,
      formatId: format.id,
      datos: { nombre: "Carlos López", edad: 35 },
      estado: "pendiente"
    });

    const completion4 = await Completion.create({
      usuarioId: user.id,
      formatId: format.id,
      datos: { nombre: "Ana Martínez", edad: 28 },
      estado: "pendiente"
    });

    const completion5 = await Completion.create({
      usuarioId: user.id,
      formatId: format.id,
      datos: { nombre: "Pedro Rodríguez", edad: 42 },
      estado: "pendiente"
    });

    console.log("✅ Datos adicionales creados exitosamente");
    console.log("📝 Nuevos Completions:", completion3.id, completion4.id, completion5.id);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creando datos adicionales:", error);
    process.exit(1);
  }
};

addMoreTestData();