const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET inventario completo del negocio
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, lowStock } = req.query;
    let query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.sale_price,
        p.cost_price,
        p.min_stock,
        COALESCE(i.current_stock, 0) as current_stock,
        c.name as category_name,
        CASE 
          WHEN COALESCE(i.current_stock, 0) <= p.min_stock THEN 'low'
          WHEN COALESCE(i.current_stock, 0) = 0 THEN 'out'
          ELSE 'ok'
        END as status
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.business_id = $1 AND p.is_active = true
    `;
    
    const params = [req.user.businessId];
    let paramIndex = 2;

    if (category) {
      query += ` AND c.name = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (lowStock === 'true') {
      query += ` AND COALESCE(i.current_stock, 0) <= p.min_stock`;
    }

    query += ` ORDER BY p.name`;
    const result = await db.query(query, params);
    
    const summary = {
      total_products: result.rows.length,
      total_value: result.rows.reduce((sum, p) => sum + (p.current_stock * p.cost_price), 0),
      low_stock_count: result.rows.filter(p => p.status === 'low').length,
      out_of_stock_count: result.rows.filter(p => p.status === 'out').length
    };

    res.json({
      summary,
      products: result.rows
    });
  } catch (error) {
    console.error('❌ Error al obtener inventario:', error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// GET inventario por producto
router.get('/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const result = await db.query(
      `SELECT 
        p.*,
        COALESCE(i.current_stock, 0) as current_stock,
        i.last_restock_date
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = $1 AND p.business_id = $2`,
      [productId, req.user.businessId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Obtener últimos movimientos
    const movements = await db.query(
      `SELECT * FROM inventory_movements 
       WHERE product_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [productId]
    );

    res.json({
      product: result.rows[0],
      movements: movements.rows
    });
  } catch (error) {
    console.error('❌ Error al obtener inventario:', error);
    res.status(500).json({ error: 'Error al obtener inventario' });
  }
});

// POST agregar stock
router.post('/add-stock', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity, notes } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'productId y quantity son requeridos' });
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Obtener stock actual
      const currentResult = await client.query(
        `SELECT current_stock FROM inventory WHERE product_id = $1`,
        [productId]
      );

      const previousStock = currentResult.rows[0]?.current_stock || 0;
      const newStock = previousStock + quantity;

      // Actualizar o crear inventario
      await client.query(
        `INSERT INTO inventory (product_id, current_stock, last_restock_date)
         VALUES ($1, $2, NOW())
         ON CONFLICT (product_id) DO UPDATE
         SET current_stock = $2, last_updated = NOW()`,
        [productId, newStock]
      );

      // Registrar movimiento
      await client.query(
        `INSERT INTO inventory_movements (product_id, user_id, movement_type, quantity, previous_stock, new_stock, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [productId, req.user.userId, 'restock', quantity, previousStock, newStock, notes || '']
      );

      await client.query('COMMIT');

      res.json({
        message: 'Stock agregado exitosamente',
        previous_stock: previousStock,
        new_stock: newStock,
        quantity_added: quantity
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error al agregar stock:', error);
    res.status(500).json({ error: 'Error al agregar stock' });
  }
});

// POST reducir stock
router.post('/reduce-stock', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'productId y quantity son requeridos' });
    }

    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const currentResult = await client.query(
        `SELECT current_stock FROM inventory WHERE product_id = $1`,
        [productId]
      );

      const previousStock = currentResult.rows[0]?.current_stock || 0;

      if (previousStock < quantity) {
        throw new Error('Stock insuficiente');
      }

      const newStock = previousStock - quantity;

      await client.query(
        `UPDATE inventory SET current_stock = $1, last_updated = NOW() WHERE product_id = $2`,
        [newStock, productId]
      );

      await client.query(
        `INSERT INTO inventory_movements (product_id, user_id, movement_type, quantity, previous_stock, new_stock, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [productId, req.user.userId, reason || 'sale', -quantity, previousStock, newStock, '']
      );

      await client.query('COMMIT');

      res.json({
        message: 'Stock reducido exitosamente',
        previous_stock: previousStock,
        new_stock: newStock,
        quantity_reduced: quantity
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error al reducir stock:', error);
    res.status(500).json({ error: error.message || 'Error al reducir stock' });
  }
});

// GET historial de movimientos
router.get('/movements/history', authenticateToken, async (req, res) => {
  try {
    const { productId, startDate, endDate, limit = 50 } = req.query;
    
    let query = `
      SELECT 
        im.*,
        p.name as product_name,
        u.username as user_name
      FROM inventory_movements im
      JOIN products p ON im.product_id = p.id
      LEFT JOIN users u ON im.user_id = u.id
      WHERE p.business_id = $1
    `;
    
    const params = [req.user.businessId];
    let paramIndex = 2;

    if (productId) {
      query += ` AND im.product_id = $${paramIndex}`;
      params.push(productId);
      paramIndex++;
    }

    if (startDate) {
      query += ` AND im.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      query += ` AND im.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    query += ` ORDER BY im.created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

module.exports = router;
