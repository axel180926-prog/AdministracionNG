import { Router } from 'express';
import { SalesController } from '../controllers/sales.controller';

const router = Router();

router.get('/', SalesController.getSales);
router.get('/report', SalesController.getSalesReport);
router.get('/:id', SalesController.getSaleById);
router.post('/', SalesController.createSale);
router.put('/:id/status', SalesController.updateSaleStatus);

export default router;
