import { Router } from 'express';
import { SalesController } from '../controllers/sales.controller';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.get('/', SalesController.getSales);
router.get('/report', SalesController.getSalesReport);
router.get('/:id', SalesController.getSaleById);
router.post('/', SalesController.createSale);
router.put('/:id/status', SalesController.updateSaleStatus);

export default router;
