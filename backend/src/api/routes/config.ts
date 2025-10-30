import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

// Configuración general
router.get('/', ConfigController.getConfig);
router.put('/', ConfigController.updateConfig);

// Módulos
router.get('/modules', ConfigController.getModules);
router.get('/modules/available', ConfigController.getAvailableModules);
router.get('/modules/categories', ConfigController.getModuleCategories);
router.get('/modules/by-category/:category', ConfigController.getModulesByCategory);
router.post('/modules/toggle', ConfigController.toggleModule);

// Información del negocio
router.get('/business', ConfigController.getBusinessInfo);
router.put('/business', ConfigController.updateBusinessInfo);

export default router;
