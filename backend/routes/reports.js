const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const reportsService = require('../services/reportsService');

const router = express.Router();

/**
 * Middleware: Aplicar autenticación a todas las rutas
 */
router.use(authenticateToken);

/**
 * GET /api/reports/sales/daily
 * Obtener ventas del día actual
 */
router.get('/sales/daily', async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const result = await reportsService.getDailySales(businessId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: 'Reporte diario obtenido exitosamente',
      report: result.data,
      period: 'today'
    });
  } catch (error) {
    console.error('❌ Error en GET /reports/sales/daily:', error);
    res.status(500).json({ error: 'Error al obtener reporte diario' });
  }
});

/**
 * GET /api/reports/sales/weekly
 * Obtener ventas de los últimos 7 días
 */
router.get('/sales/weekly', async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const result = await reportsService.getWeeklySales(businessId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: 'Reporte semanal obtenido exitosamente',
      report: result.data,
      period: 'last_7_days'
    });
  } catch (error) {
    console.error('❌ Error en GET /reports/sales/weekly:', error);
    res.status(500).json({ error: 'Error al obtener reporte semanal' });
  }
});

/**
 * GET /api/reports/inventory
 * Obtener resumen de inventario
 */
router.get('/inventory', async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const result = await reportsService.getInventorySummary(businessId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: 'Resumen de inventario obtenido exitosamente',
      inventory: result.data
    });
  } catch (error) {
    console.error('❌ Error en GET /reports/inventory:', error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

/**
 * GET /api/reports/top-products
 * Obtener top 10 productos más vendidos
 */
router.get('/top-products', async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const result = await reportsService.getTopProducts(businessId, limit);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: 'Productos más vendidos obtenidos exitosamente',
      products: result.data,
      limit
    });
  } catch (error) {
    console.error('❌ Error en GET /reports/top-products:', error);
    res.status(500).json({ error: 'Error al obtener productos más vendidos' });
  }
});

/**
 * GET /api/reports/low-stock
 * Obtener productos con bajo stock
 */
router.get('/low-stock', async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const result = await reportsService.getLowStockProducts(businessId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: 'Productos con bajo stock obtenidos exitosamente',
      products: result.data,
      count: result.data.length
    });
  } catch (error) {
    console.error('❌ Error en GET /reports/low-stock:', error);
    res.status(500).json({ error: 'Error al obtener productos con bajo stock' });
  }
});

/**
 * GET /api/reports/metrics
 * Obtener métricas generales del negocio
 */
router.get('/metrics', async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const result = await reportsService.getBusinessMetrics(businessId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      message: 'Métricas del negocio obtenidas exitosamente',
      metrics: result.data
    });
  } catch (error) {
    console.error('❌ Error en GET /reports/metrics:', error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

module.exports = router;
