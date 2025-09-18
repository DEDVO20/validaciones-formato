import { sequelize } from "./config/db";
import { User } from "./models/user.model";
import { Format } from "./models/formats.model";
import { Completion } from "./models/completion.model";
import { Validacion } from "./models/validacion.model";
import bcrypt from "bcrypt";

const createDashboardData = async () => {
  try {
    console.log("🚀 Creando datos para el dashboard...");
    
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Crear más usuarios de prueba
    const usuarios = [
      { name: "Carlos Mendoza", email: "carlos@empresa.com", role: "user" },
      { name: "Ana Rodriguez", email: "ana@empresa.com", role: "user" },
      { name: "Luis García", email: "luis@empresa.com", role: "validator" },
      { name: "María López", email: "maria@empresa.com", role: "validator" },
      { name: "Pedro Sánchez", email: "pedro@empresa.com", role: "user" },
      { name: "Laura Martín", email: "laura@empresa.com", role: "user" },
      { name: "Jorge Ruiz", email: "jorge@empresa.com", role: "user" },
      { name: "Carmen Díaz", email: "carmen@empresa.com", role: "user" }
    ];

    const createdUsers = [];
    for (const userData of usuarios) {
      const [user] = await User.findOrCreate({
        where: { email: userData.email },
        defaults: {
          ...userData,
          password: hashedPassword
        }
      });
      createdUsers.push(user);
    }

    // Crear más formatos de prueba
    const formatos = [
      {
        titulo: "Solicitud de Vacaciones",
        contenido: "Empleado: {{nombre}}\nFechas: {{fecha_inicio}} - {{fecha_fin}}\nMotivo: {{motivo}}",
        variables: [
          { nombre: "nombre", tipo: "text", requerido: true },
          { nombre: "fecha_inicio", tipo: "date", requerido: true },
          { nombre: "fecha_fin", tipo: "date", requerido: true },
          { nombre: "motivo", tipo: "textarea", requerido: true }
        ],
        estado: "activo"
      },
      {
        titulo: "Reporte de Gastos",
        contenido: "Empleado: {{empleado}}\nMonto: ${{monto}}\nConcepto: {{concepto}}\nFecha: {{fecha}}",
        variables: [
          { nombre: "empleado", tipo: "text", requerido: true },
          { nombre: "monto", tipo: "number", requerido: true },
          { nombre: "concepto", tipo: "text", requerido: true },
          { nombre: "fecha", tipo: "date", requerido: true }
        ],
        estado: "activo"
      },
      {
        titulo: "Evaluación de Desempeño",
        contenido: "Empleado: {{empleado}}\nPeriodo: {{periodo}}\nCalificación: {{calificacion}}\nComentarios: {{comentarios}}",
        variables: [
          { nombre: "empleado", tipo: "text", requerido: true },
          { nombre: "periodo", tipo: "text", requerido: true },
          { nombre: "calificacion", tipo: "number", requerido: true },
          { nombre: "comentarios", tipo: "textarea", requerido: false }
        ],
        estado: "activo"
      },
      {
        titulo: "Solicitud de Capacitación",
        contenido: "Solicitante: {{nombre}}\nCurso: {{curso}}\nJustificación: {{justificacion}}",
        variables: [
          { nombre: "nombre", tipo: "text", requerido: true },
          { nombre: "curso", tipo: "text", requerido: true },
          { nombre: "justificacion", tipo: "textarea", requerido: true }
        ],
        estado: "activo"
      },
      {
        titulo: "Incidencia de Seguridad",
        contenido: "Reportado por: {{reportero}}\nTipo: {{tipo}}\nDescripción: {{descripcion}}\nUrgencia: {{urgencia}}",
        variables: [
          { nombre: "reportero", tipo: "text", requerido: true },
          { nombre: "tipo", tipo: "select", opciones: ["Accidente", "Incidente", "Casi accidente"], requerido: true },
          { nombre: "descripcion", tipo: "textarea", requerido: true },
          { nombre: "urgencia", tipo: "select", opciones: ["Baja", "Media", "Alta", "Crítica"], requerido: true }
        ],
        estado: "activo"
      }
    ];

    const createdFormats = [];
    for (const formatData of formatos) {
      const [format] = await Format.findOrCreate({
        where: { titulo: formatData.titulo },
        defaults: formatData
      });
      createdFormats.push(format);
    }

    // Crear completions con diferentes estados y fechas variadas
    const completionsData = [
      // Solicitudes de Vacaciones
      { formatIndex: 0, userIndex: 0, datos: { nombre: "Carlos Mendoza", fecha_inicio: "2024-02-15", fecha_fin: "2024-02-20", motivo: "Vacaciones familiares" }, estado: "aprobado", daysAgo: 45 },
      { formatIndex: 0, userIndex: 1, datos: { nombre: "Ana Rodriguez", fecha_inicio: "2024-03-01", fecha_fin: "2024-03-05", motivo: "Descanso personal" }, estado: "pendiente", daysAgo: 30 },
      { formatIndex: 0, userIndex: 4, datos: { nombre: "Pedro Sánchez", fecha_inicio: "2024-03-15", fecha_fin: "2024-03-22", motivo: "Viaje de estudios" }, estado: "rechazado", daysAgo: 25 },
      
      // Reportes de Gastos
      { formatIndex: 1, userIndex: 0, datos: { empleado: "Carlos Mendoza", monto: 150.50, concepto: "Almuerzo de negocios", fecha: "2024-01-15" }, estado: "aprobado", daysAgo: 60 },
      { formatIndex: 1, userIndex: 1, datos: { empleado: "Ana Rodriguez", monto: 85.00, concepto: "Transporte", fecha: "2024-02-01" }, estado: "aprobado", daysAgo: 50 },
      { formatIndex: 1, userIndex: 5, datos: { empleado: "Laura Martín", monto: 200.00, concepto: "Material de oficina", fecha: "2024-03-10" }, estado: "pendiente", daysAgo: 20 },
      { formatIndex: 1, userIndex: 6, datos: { empleado: "Jorge Ruiz", monto: 75.25, concepto: "Combustible", fecha: "2024-03-20" }, estado: "pendiente", daysAgo: 15 },
      
      // Evaluaciones de Desempeño
      { formatIndex: 2, userIndex: 0, datos: { empleado: "Carlos Mendoza", periodo: "Q1 2024", calificacion: 4.5, comentarios: "Excelente desempeño" }, estado: "aprobado", daysAgo: 35 },
      { formatIndex: 2, userIndex: 4, datos: { empleado: "Pedro Sánchez", periodo: "Q1 2024", calificacion: 3.8, comentarios: "Buen trabajo, puede mejorar" }, estado: "aprobado", daysAgo: 32 },
      { formatIndex: 2, userIndex: 7, datos: { empleado: "Carmen Díaz", periodo: "Q1 2024", calificacion: 4.2, comentarios: "Muy buena actitud" }, estado: "pendiente", daysAgo: 10 },
      
      // Solicitudes de Capacitación
      { formatIndex: 3, userIndex: 1, datos: { nombre: "Ana Rodriguez", curso: "Gestión de Proyectos", justificacion: "Necesario para mi rol actual" }, estado: "aprobado", daysAgo: 40 },
      { formatIndex: 3, userIndex: 5, datos: { nombre: "Laura Martín", curso: "Excel Avanzado", justificacion: "Mejorar análisis de datos" }, estado: "pendiente", daysAgo: 12 },
      { formatIndex: 3, userIndex: 6, datos: { nombre: "Jorge Ruiz", curso: "Liderazgo", justificacion: "Desarrollo profesional" }, estado: "rechazado", daysAgo: 8 },
      
      // Incidencias de Seguridad
      { formatIndex: 4, userIndex: 0, datos: { reportero: "Carlos Mendoza", tipo: "Incidente", descripcion: "Derrame de líquido en pasillo", urgencia: "Media" }, estado: "aprobado", daysAgo: 28 },
      { formatIndex: 4, userIndex: 7, datos: { reportero: "Carmen Díaz", tipo: "Casi accidente", descripcion: "Cable suelto en área de trabajo", urgencia: "Alta" }, estado: "pendiente", daysAgo: 5 },
      { formatIndex: 4, userIndex: 4, datos: { reportero: "Pedro Sánchez", tipo: "Accidente", descripcion: "Corte menor en la mano", urgencia: "Baja" }, estado: "aprobado", daysAgo: 18 }
    ];

    const createdCompletions = [];
    for (const compData of completionsData) {
      const user = createdUsers[compData.userIndex];
      const format = createdFormats[compData.formatIndex];
      
      if (!user || !format) {
        console.warn(`Saltando completion: usuario o formato no encontrado`);
        continue;
      }
      
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - compData.daysAgo);
      
      const completion = await Completion.create({
        usuarioId: user.id,
        formatId: format.id,
        datos: compData.datos,
        estado: compData.estado,
        createdAt,
        updatedAt: createdAt
      });
      createdCompletions.push(completion);
    }

    // Crear validaciones para los completions aprobados y rechazados
    const validators = createdUsers.filter(user => user.role === 'validator');
    
    for (const completion of createdCompletions) {
      if (completion.estado !== 'pendiente' && validators.length > 0) {
        const randomValidator = validators[Math.floor(Math.random() * validators.length)];
        
        if (randomValidator) {
          const validationDate = new Date(completion.createdAt);
          validationDate.setHours(validationDate.getHours() + Math.floor(Math.random() * 48) + 1); // 1-48 horas después
          
          await Validacion.create({
            completionId: completion.id,
            validadorId: randomValidator.id,
            estado: completion.estado,
            observaciones: completion.estado === 'aprobado' 
              ? 'Documentación completa y correcta' 
              : 'Requiere información adicional o correcciones',
            createdAt: validationDate,
            updatedAt: validationDate
          });
        }
      }
    }

    console.log("✅ Datos del dashboard creados exitosamente:");
    console.log(`👥 Usuarios creados: ${createdUsers.length}`);
    console.log(`📋 Formatos creados: ${createdFormats.length}`);
    console.log(`📝 Completions creados: ${createdCompletions.length}`);
    console.log(`✅ Validaciones creadas para completions procesados`);
    
    // Mostrar estadísticas
    const pendientes = createdCompletions.filter(c => c.estado === 'pendiente').length;
    const aprobados = createdCompletions.filter(c => c.estado === 'aprobado').length;
    const rechazados = createdCompletions.filter(c => c.estado === 'rechazado').length;
    
    console.log(`\n📊 Estadísticas:`);
    console.log(`   Pendientes: ${pendientes}`);
    console.log(`   Aprobados: ${aprobados}`);
    console.log(`   Rechazados: ${rechazados}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creando datos del dashboard:", error);
    process.exit(1);
  }
};

createDashboardData();