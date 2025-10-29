const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET todas las ventas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    let query = 'SELECT s.*, p.name as product_name, u.username as employee_name FROM sales s LEFT JOIN products p ON s.product_id = p.id LEFT JOIN users u ON s.employee_id = u.id WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND s.sale_date >= $' + (params.length + 1);
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND s.sale_date <= $' + (params.length + 1);
      params.push(endDate);
    }
    if (employeeId) {
      query += ' AND s.employee_id = $' + (params.length + 1);
      params.push(employeeId);
    }

    query += ' ORDER BY s.sale_date DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// GET venta por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT s.*, p.name as product_name, u.username as employee_name FROM sales s LEFT JOIN products p ON s.product_id = p.id LEFT JOIN users u ON s.employee_id = u.id WHERE s.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener venta:', error);
    res.status(500).json({ error: 'Error al obtener venta' });
  }
});

// POST registrar venta (requiere autenticación)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity, unitPrice, paymentMethod, notes } = req.body;
    const employeeId = req.user.userId;
    const saleDate = new Date().toISOString().split('T')[0];

    if (!productId || !quantity || !unitPrice) {
      return res.status(400).json({ error: 'productId, quantity y unitPrice son requeridos' });
    }

    const total = quantity * unitPrice;

    // Iniciar transacción
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      // Insertar venta
      const saleResult = await client.query(
        'INSERT INTO sales (sale_date, product_id, quantity, unit_price, total, employee_id, payment_method, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [saleDate, productId, quantity, unitPrice, total, employeeId, paymentMethod, notes]
      );

      // Actualizar inventario
      await client.query(
        'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
        [quantity, productId]
      );

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Venta registrada exitosamente',
        sale: saleResult.rows[0]
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Error al registrar venta:', error);
    res.status(500).json({ error: 'Error al registrar venta' });
  }
});

// PUT editar venta (requiere autenticación)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, unitPrice, paymentMethod, notes } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (quantity !== undefined) { updates.push(`quantity = $${paramIndex++}`); params.push(quantity); }
    if (unitPrice !== undefined) { updates.push(`unit_price = $${paramIndex++}`); params.push(unitPrice); }
    if (paymentMethod !== undefined) { updates.push(`payment_method = $${paramIndex++}`); params.push(paymentMethod); }
    if (notes !== undefined) { updates.push(`notes = $${paramIndex++}`); params.push(notes); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    params.push(id);

    const result = await db.query(
      `UPDATE sales SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json({
      message: 'Venta actualizada exitosamente',
      sale: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al actualizar venta:', error);
    res.status(500).json({ error: 'Error al actualizar venta' });
  }
});

module.exports = router;
