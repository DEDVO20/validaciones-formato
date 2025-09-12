import { Router } from 'express';
import { getStats, getUserStats } from '../controllers/stats.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener estadísticas generales del sistema
router.get('/', getStats);

// Obtener estadísticas del usuario actual
router.get('/user', getUserStats);

export default router;