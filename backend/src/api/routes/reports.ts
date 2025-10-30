import { Router } from 'express';
import { verifyToken } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Get all reports' });
});

export default router;
