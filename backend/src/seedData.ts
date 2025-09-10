import { sequelize } from "./config/db";
import { User } from "./models/user.model";
import { Format } from "./models/formats.model";
import { Completion } from "./models/completion.model";
import { Validacion } from "./models/validacion.model";
import bcrypt from "bcrypt";

const seedData = async () => {
  try {
    // Crear usuarios de prueba
    const hashedPassword = await bcrypt.hash("123456", 10);
    
    const admin = await User.findOrCreate({
      where: { email: "admin@example.com" },
      defaults: {
        name: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin"
      }
    });

    const validator = await User.findOrCreate({
      where: { email: "validator@example.com" },
      defaults: {
        name: "Validator",
        email: "validator@example.com",
        password: hashedPassword,
        role: "validator"
      }
    });

    const user = await User.findOrCreate({
      where: { email: "user@example.com" },
      defaults: {
        name: "Usuario Test",
        email: "user@example.com",
        password: hashedPassword,
        role: "user"
      }
    });

    // Crear formato de prueba
    const format = await Format.findOrCreate({
      where: { titulo: "Formato de Prueba" },
      defaults: {
        titulo: "Formato de Prueba",
        contenido: "Nombre: {{nombre}}\nEdad: {{edad}}",
        variables: [
          { nombre: "nombre", tipo: "text", requerido: true },
          { nombre: "edad", tipo: "number", requerido: true }
        ],
        estado: "activo"
      }
    });

    // Crear completions de prueba
    const completion1 = await Completion.findOrCreate({
      where: { usuarioId: user[0].id, formatId: format[0].id },
      defaults: {
        usuarioId: user[0].id,
        formatId: format[0].id,
        datos: { nombre: "Juan Pérez", edad: 30 },
        estado: "pendiente"
      }
    });

    const completion2 = await Completion.findOrCreate({
      where: { usuarioId: user[0].id, formatId: format[0].id },
      defaults: {
        usuarioId: user[0].id,
        formatId: format[0].id,
        datos: { nombre: "María García", edad: 25 },
        estado: "pendiente"
      }
    });

    // Crear validaciones de prueba
    const validacion1 = await Validacion.findOrCreate({
      where: { completionId: completion1[0].id },
      defaults: {
        completionId: completion1[0].id,
        validadorId: validator[0].id,
        estado: "pendiente",
        observaciones: "Pendiente de revisión"
      }
    });

    const validacion2 = await Validacion.findOrCreate({
      where: { completionId: completion2[0].id },
      defaults: {
        completionId: completion2[0].id,
        validadorId: validator[0].id,
        estado: "aprobado",
        observaciones: "Aprobado correctamente"
      }
    });

    console.log("✅ Datos de prueba creados exitosamente");
    console.log("👤 Usuarios:", {
      admin: admin[0].email,
      validator: validator[0].email,
      user: user[0].email
    });
    console.log("📋 Formato:", format[0].titulo);
    console.log("📝 Completions:", completion1[0].id, completion2[0].id);
    console.log("✅ Validaciones:", validacion1[0].id, validacion2[0].id);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creando datos de prueba:", error);
    process.exit(1);
  }
};

seedData();