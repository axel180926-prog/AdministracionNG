const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET todos los productos
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM products WHERE active = true ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// POST crear producto (requiere autenticación)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, sku, description, price, cost, quantity, category } = req.body;

    if (!name || !sku || !price) {
      return res.status(400).json({ error: 'Name, SKU y price son requeridos' });
    }

    const result = await db.query(
      'INSERT INTO products (name, sku, description, price, cost, quantity, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, sku, description, price || 0, cost || 0, quantity || 0, category]
    );

    res.status(201).json({
      message: 'Producto creado exitosamente',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al crear producto:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El SKU ya existe' });
    }
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT editar producto (requiere autenticación)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, description, price, cost, quantity, category, active } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name !== undefined) { updates.push(`name = $${paramIndex++}`); params.push(name); }
    if (sku !== undefined) { updates.push(`sku = $${paramIndex++}`); params.push(sku); }
    if (description !== undefined) { updates.push(`description = $${paramIndex++}`); params.push(description); }
    if (price !== undefined) { updates.push(`price = $${paramIndex++}`); params.push(price); }
    if (cost !== undefined) { updates.push(`cost = $${paramIndex++}`); params.push(cost); }
    if (quantity !== undefined) { updates.push(`quantity = $${paramIndex++}`); params.push(quantity); }
    if (category !== undefined) { updates.push(`category = $${paramIndex++}`); params.push(category); }
    if (active !== undefined) { updates.push(`active = $${paramIndex++}`); params.push(active); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    updates.push(`updated_at = $${paramIndex++}`);
    params.push(new Date());
    params.push(id);

    const result = await db.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      message: 'Producto actualizado exitosamente',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE producto (requiere autenticación)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
