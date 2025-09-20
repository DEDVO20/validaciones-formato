import app from "./app";
import { connectDB } from "./config/db";
import { syncModels } from "./models";
import { CronJobService } from "./utils/cronJobs";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    await syncModels();
    
    // Inicializar cron jobs
    CronJobService.startAllJobs();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error);
  }
};

// Manejar cierre graceful del servidor
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  CronJobService.stopAllJobs();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Cerrando servidor...');
  CronJobService.stopAllJobs();
  process.exit(0);
});

startServer();
