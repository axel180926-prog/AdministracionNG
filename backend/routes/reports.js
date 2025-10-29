const express = require('express');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Reporte por fecha
router.get('/sales-by-date', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate y endDate son requeridos' });
    }

    const result = await db.query(
      `SELECT 
        s.sale_date,
        COUNT(*) as total_sales,
        SUM(s.quantity) as total_quantity,
        SUM(s.total) as total_revenue
      FROM sales s
      WHERE s.sale_date BETWEEN $1 AND $2
      GROUP BY s.sale_date
      ORDER BY s.sale_date DESC`,
      [startDate, endDate]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error en reporte por fecha:', error);
    res.status(500).json({ error: 'Error en reporte por fecha' });
  }
});

// Reporte por producto
router.get('/sales-by-product', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `SELECT 
      p.id,
      p.name,
      p.sku,
      COUNT(*) as times_sold,
      SUM(s.quantity) as total_quantity,
      SUM(s.total) as total_revenue,
      AVG(s.unit_price) as avg_price
    FROM sales s
    LEFT JOIN products p ON s.product_id = p.id
    WHERE 1=1`;

    const params = [];

    if (startDate) {
      query += ` AND s.sale_date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND s.sale_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ` GROUP BY p.id, p.name, p.sku ORDER BY total_revenue DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error en reporte por producto:', error);
    res.status(500).json({ error: 'Error en reporte por producto' });
  }
});

// Reporte por empleado
router.get('/sales-by-employee', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `SELECT 
      u.id,
      u.username,
      u.full_name,
      COUNT(*) as total_sales,
      SUM(s.quantity) as total_quantity,
      SUM(s.total) as total_revenue
    FROM sales s
    LEFT JOIN users u ON s.employee_id = u.id
    WHERE 1=1`;

    const params = [];

    if (startDate) {
      query += ` AND s.sale_date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND s.sale_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    query += ` GROUP BY u.id, u.username, u.full_name ORDER BY total_revenue DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error en reporte por empleado:', error);
    res.status(500).json({ error: 'Error en reporte por empleado' });
  }
});

// Resumen general
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `SELECT 
      COUNT(*) as total_sales,
      SUM(s.quantity) as total_quantity,
      SUM(s.total) as total_revenue,
      AVG(s.total) as avg_sale,
      COUNT(DISTINCT s.employee_id) as total_employees
    FROM sales s
    WHERE 1=1`;

    const params = [];

    if (startDate) {
      query += ` AND s.sale_date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND s.sale_date <= $${params.length + 1}`;
      params.push(endDate);
    }

    const salesResult = await db.query(query, params);

    // Total productos
    const productsResult = await db.query('SELECT COUNT(*) as total_products FROM products WHERE active = true');

    // Total usuarios
    const usersResult = await db.query('SELECT COUNT(*) as total_users FROM users WHERE active = true');

    res.json({
      sales: salesResult.rows[0],
      products: productsResult.rows[0],
      users: usersResult.rows[0]
    });
  } catch (error) {
    console.error('❌ Error en resumen:', error);
    res.status(500).json({ error: 'Error en resumen' });
  }
});

module.exports = router;
