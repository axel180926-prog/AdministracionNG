import { Router } from 'express';
import { verifyToken, isAdmin } from '../middlewares/auth';

const router = Router();

router.use(verifyToken);

router.get('/', isAdmin, (req, res) => {
  res.json({ success: true, message: 'Get all users' });
});

router.post('/', isAdmin, (req, res) => {
  res.json({ success: true, message: 'Create user' });
});

export default router;
