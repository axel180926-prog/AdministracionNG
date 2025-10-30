const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const salesService = require('../services/salesService');

const router = express.Router();

/**
 * Middleware: Aplicar autenticación a todas las rutas
 */
router.use(authenticateToken);

/**
 * POST /api/sales
 * Crear una nueva venta (CON TRANSACCIÓN)
 * Body: { items: [{productId, quantity}, ...], paymentMethod, customerName, enableTax, taxRate, discount }
 */
router.post(
  '/',
  [
    body('items').isArray().notEmpty().withMessage('Items es requerido y debe ser un array'),
    body('items.*.productId').isInt().withMessage('productId debe ser un número'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('quantity debe ser un número positivo'),
    body('paymentMethod').optional().trim(),
    body('customerName').optional().trim(),
    body('enableTax').optional().isBoolean(),
    body('taxRate').optional().isFloat({ min: 0, max: 100 }),
    body('discount').optional().isFloat({ min: 0 })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validación fallida', details: errors.array() });
      }

      const businessId = req.user.businessId;
      const userId = req.user.userId;
      const saleData = req.body;

      const result = await salesService.createSale(businessId, userId, saleData);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({
        message: 'Venta creada exitosamente',
        sale: result.sale
      });
    } catch (error) {
      console.error('❌ Error en POST /sales:', error);
      res.status(500).json({ error: 'Error al crear venta' });
    }
  }
);

/**
 * GET /api/sales
 * Listar todas las ventas del negocio
 * Query: limit, offset, startDate, endDate
 */
router.get(
  '/',
  [
    validationResult()
  ],
  async (req, res) => {
    try {
      const businessId = req.user.businessId;
      const { limit = 10, offset = 0, startDate, endDate } = req.query;

      const result = await salesService.getSales(businessId, {
        limit: Math.min(parseInt(limit) || 10, 100),
        offset: parseInt(offset) || 0,
        startDate,
        endDate
      });

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        message: 'Ventas obtenidas exitosamente',
        sales: result.sales
      });
    } catch (error) {
      console.error('❌ Error en GET /sales:', error);
      res.status(500).json({ error: 'Error al obtener ventas' });
    }
  }
);

/**
 * GET /api/sales/today
 * Obtener ventas de hoy
 */
router.get('/today', async (req, res) => {
  try {
    const businessId = req.user.businessId;

    const result = await salesService.getSalesToday(businessId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: 'Ventas de hoy obtenidas exitosamente',
      sales: result.sales
    });
  } catch (error) {
    console.error('❌ Error en GET /sales/today:', error);
    res.status(500).json({ error: 'Error al obtener ventas del día' });
  }
});

/**
 * GET /api/sales/:id
 * Obtener detalle de una venta
 */
router.get(
  '/:id',
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validación fallida', details: errors.array() });
      }

      const businessId = req.user.businessId;
      const saleId = req.params.id;

      const result = await salesService.getSaleById(businessId, saleId);

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      res.json({
        message: 'Venta obtenida exitosamente',
        sale: result.sale
      });
    } catch (error) {
      console.error('❌ Error en GET /sales/:id:', error);
      res.status(500).json({ error: 'Error al obtener venta' });
    }
  }
);

/**
 * PATCH /api/sales/:id/cancel
 * Cancelar una venta (devuelve stock)
 */
router.patch(
  '/:id/cancel',
  [param('id').isInt()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validación fallida', details: errors.array() });
      }

      const businessId = req.user.businessId;
      const saleId = req.params.id;

      const result = await salesService.cancelSale(businessId, saleId);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        message: result.message,
        saleId
      });
    } catch (error) {
      console.error('❌ Error en PATCH /sales/:id/cancel:', error);
      res.status(500).json({ error: 'Error al cancelar venta' });
    }
  }
);

module.exports = router;
