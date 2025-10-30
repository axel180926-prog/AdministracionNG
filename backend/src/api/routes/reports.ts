import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.get('/sales', ReportsController.getSalesReport);
router.get('/sales-by-category', ReportsController.getSalesByCategory);
router.get('/top-products', ReportsController.getTopProducts);
router.get('/inventory', ReportsController.getInventoryReport);
router.get('/low-stock', ReportsController.getLowStockReport);
router.get('/movements', ReportsController.getInventoryMovements);
router.get('/dashboard', ReportsController.getDashboardSummary);
router.get('/daily', ReportsController.getDailyReport);
router.get('/payment-methods', ReportsController.getSalesByPaymentMethod);

export default router;
