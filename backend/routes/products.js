const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const productService = require('../services/productService');

const router = express.Router();

/**
 * Middleware: Aplicar autenticación a todas las rutas
 */
router.use(authenticateToken);

/**
 * GET /api/products
 * Listar productos con paginación y búsqueda
 * Query: limit, offset, search, categoryId
 */
router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('search').optional().trim(),
    query('categoryId').optional().isInt().toInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validación fallida', details: errors.array() });
      }

      const businessId = req.user.businessId;
      const { limit = 10, offset = 0, search = '', categoryId = null } = req.query;

      const result = await productService.getProducts(businessId, { limit, offset, search, categoryId });

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        message: 'Productos obtenidos exitosamente',
        ...result
      });
    } catch (error) {
      console.error('❌ Error en GET /products:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  }
);

/**
 * GET /api/products/:id
 * Obtener detalle de un producto
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
      const productId = req.params.id;

      const result = await productService.getProductById(businessId, productId);

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      res.json({
        message: 'Producto obtenido exitosamente',
        product: result.product
      });
    } catch (error) {
      console.error('❌ Error en GET /products/:id:', error);
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  }
);

/**
 * POST /api/products
 * Crear nuevo producto
 * Solo owner y admin
 */
router.post(
  '/',
  [
    checkPermission(['owner', 'admin']),
    body('name').notEmpty().withMessage('Nombre requerido').trim(),
    body('salePrice')
      .notEmpty().withMessage('Precio de venta requerido')
      .isFloat({ min: 0.01 }).withMessage('Precio debe ser mayor a 0'),
    body('costPrice').optional().isFloat({ min: 0 }).withMessage('Precio de costo no puede ser negativo'),
    body('sku').optional().trim(),
    body('description').optional().trim(),
    body('categoryId').optional().isInt().toInt(),
    body('minStock').optional().isInt({ min: 0 }).toInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validación fallida', details: errors.array() });
      }

      const businessId = req.user.businessId;
      const productData = {
        name: req.body.name,
        description: req.body.description,
        categoryId: req.body.categoryId,
        sku: req.body.sku,
        costPrice: req.body.costPrice,
        salePrice: req.body.salePrice,
        minStock: req.body.minStock
      };

      const result = await productService.createProduct(businessId, productData);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({
        message: 'Producto creado exitosamente',
        product: result.product
      });
    } catch (error) {
      console.error('❌ Error en POST /products:', error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  }
);

/**
 * PUT /api/products/:id
 * Actualizar un producto
 * Solo owner y admin
 */
router.put(
  '/:id',
  [
    checkPermission(['owner', 'admin']),
    param('id').isInt(),
    body('name').optional().notEmpty().withMessage('Nombre no puede estar vacío').trim(),
    body('salePrice').optional().isFloat({ min: 0.01 }).withMessage('Precio debe ser mayor a 0'),
    body('costPrice').optional().isFloat({ min: 0 }).withMessage('Precio de costo no puede ser negativo'),
    body('sku').optional().trim(),
    body('description').optional().trim(),
    body('categoryId').optional().isInt().toInt(),
    body('minStock').optional().isInt({ min: 0 }).toInt(),
    body('isActive').optional().isBoolean()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validación fallida', details: errors.array() });
      }

      const businessId = req.user.businessId;
      const productId = req.params.id;

      // Construir objeto de actualizaciones solo con campos proporcionados
      const updates = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.categoryId !== undefined) updates.categoryId = req.body.categoryId;
      if (req.body.sku !== undefined) updates.sku = req.body.sku;
      if (req.body.costPrice !== undefined) updates.costPrice = req.body.costPrice;
      if (req.body.salePrice !== undefined) updates.salePrice = req.body.salePrice;
      if (req.body.minStock !== undefined) updates.minStock = req.body.minStock;
      if (req.body.isActive !== undefined) updates.isActive = req.body.isActive;

      const result = await productService.updateProduct(businessId, productId, updates);

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      res.json({
        message: 'Producto actualizado exitosamente',
        product: result.product
      });
    } catch (error) {
      console.error('❌ Error en PUT /products/:id:', error);
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  }
);

/**
 * DELETE /api/products/:id
 * Eliminar (desactivar) un producto
 * Solo owner y admin
 */
router.delete(
  '/:id',
  [
    checkPermission(['owner', 'admin']),
    param('id').isInt()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validación fallida', details: errors.array() });
      }

      const businessId = req.user.businessId;
      const productId = req.params.id;

      const result = await productService.deleteProduct(businessId, productId);

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      res.json({ message: result.message });
    } catch (error) {
      console.error('❌ Error en DELETE /products/:id:', error);
      res.status(500).json({ error: 'Error al eliminar producto' });
    }
  }
);

/**
 * GET /api/products/sku/:sku
 * Obtener producto por SKU (útil para venta rápida)
 */
router.get(
  '/sku/:sku',
  [param('sku').notEmpty().trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Validación fallida', details: errors.array() });
      }

      const businessId = req.user.businessId;
      const sku = req.params.sku;

      const result = await productService.getProductBySku(businessId, sku);

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      res.json({
        message: 'Producto obtenido exitosamente',
        product: result.product
      });
    } catch (error) {
      console.error('❌ Error en GET /products/sku/:sku:', error);
      res.status(500).json({ error: 'Error al obtener producto' });
    }
  }
);

module.exports = router;
