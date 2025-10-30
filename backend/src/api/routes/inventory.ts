import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.get('/', InventoryController.getInventory);
router.get('/summary', InventoryController.getInventorySummary);
router.get('/low-stock', InventoryController.getLowStockProducts);
router.get('/history', InventoryController.getMovementHistory);
router.post('/add', InventoryController.addStock);
router.post('/remove', InventoryController.removeStock);

export default router;
