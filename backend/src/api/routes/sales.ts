import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Get all sales' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create sale' });
});

export default router;
