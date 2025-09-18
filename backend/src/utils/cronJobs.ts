import * as cron from 'node-cron';
import { NotificationCleanupService } from './notificationCleanup.service';

export class CronJobService {
  private static jobs: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Inicia todos los cron jobs
   */
  static startAllJobs(): void {
    console.log('🕐 Iniciando cron jobs...');
    
    // Iniciar limpieza de notificaciones
    this.startNotificationCleanup();
    
    console.log('✅ Todos los cron jobs iniciados');
  }

  /**
   * Inicia el cron job de limpieza de notificaciones
   * Se ejecuta cada 6 horas
   */
  static startNotificationCleanup(): void {
    const jobName = 'notification-cleanup';
    
    // Si ya existe el job, lo detiene primero
    if (this.jobs.has(jobName)) {
      this.stopJob(jobName);
    }

    // Crear nuevo job que se ejecuta cada 6 horas
    const task = cron.schedule('0 */6 * * *', async () => {
      console.log('🧹 Ejecutando limpieza programada de notificaciones...');
      await NotificationCleanupService.runCleanupWithLogging();
    }, {
      scheduled: false, // No iniciar automáticamente
      timezone: 'America/Bogota' // Zona horaria de Colombia
    });

    // Guardar referencia del job
    this.jobs.set(jobName, task);
    
    // Iniciar el job
    task.start();
    
    console.log('✅ Cron job de limpieza de notificaciones iniciado (cada 6 horas)');
  }

  /**
   * Ejecuta limpieza manual inmediatamente (para testing)
   */
  static async runManualCleanup(): Promise<void> {
    console.log('🔧 Ejecutando limpieza manual de notificaciones...');
    await NotificationCleanupService.runCleanupWithLogging();
  }

  /**
   * Detiene un cron job específico
   */
  static stopJob(jobName: string): void {
    const job = this.jobs.get(jobName);
    if (job) {
      job.stop();
      job.destroy();
      this.jobs.delete(jobName);
      console.log(`🛑 Cron job '${jobName}' detenido`);
    }
  }

  /**
   * Detiene todos los cron jobs
   */
  static stopAllJobs(): void {
    console.log('🛑 Deteniendo todos los cron jobs...');
    
    for (const [jobName, job] of this.jobs) {
      job.stop();
      job.destroy();
      console.log(`🛑 Cron job '${jobName}' detenido`);
    }
    
    this.jobs.clear();
    console.log('✅ Todos los cron jobs detenidos');
  }

  /**
   * Obtiene el estado de todos los jobs
   */
  static getJobsStatus(): { [key: string]: boolean } {
    const status: { [key: string]: boolean } = {};
    
    for (const [jobName, job] of this.jobs) {
      status[jobName] = job.running;
    }
    
    return status;
  }

  /**
   * Programa una limpieza de prueba para ejecutarse en 1 minuto (solo para testing)
   */
  static scheduleTestCleanup(): void {
    console.log('🧪 Programando limpieza de prueba en 1 minuto...');
    
    const testTask = cron.schedule('* * * * *', async () => {
      console.log('🧪 Ejecutando limpieza de prueba...');
      await NotificationCleanupService.runCleanupWithLogging();
      
      // Detener el job de prueba después de ejecutarse una vez
      testTask.stop();
      testTask.destroy();
      console.log('🧪 Limpieza de prueba completada y job detenido');
    }, {
      scheduled: true
    });
  }
}