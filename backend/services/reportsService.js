const db = require('../config/database');

/**
 * Obtener ventas del día actual
 */
const getDailySales = async (businessId) => {
  try {
    const result = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_transactions,
        SUM(total) as total_sales,
        SUM(tax) as total_tax,
        SUM(discount) as total_discount,
        SUM(subtotal) as subtotal,
        AVG(total) as avg_transaction,
        MIN(total) as min_transaction,
        MAX(total) as max_transaction
       FROM sales
       WHERE business_id = $1
       AND DATE(created_at) = CURRENT_DATE
       AND status = 'completed'
       GROUP BY DATE(created_at)`,
      [businessId]
    );

    if (result.rows.length === 0) {
      return { success: true, data: null, message: 'No hay ventas hoy' };
    }

    return { success: true, data: result.rows[0] };
  } catch (error) {
    console.error('❌ Error en getDailySales:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener ventas de los últimos 7 días
 */
const getWeeklySales = async (businessId) => {
  try {
    const result = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_transactions,
        SUM(total) as total_sales,
        SUM(tax) as total_tax,
        SUM(discount) as total_discount,
        SUM(subtotal) as subtotal
       FROM sales
       WHERE business_id = $1
       AND created_at >= CURRENT_DATE - INTERVAL '7 days'
       AND status = 'completed'
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) DESC`,
      [businessId]
    );

    // Calcular totales agregados
    const totals = {
      total_transactions: 0,
      total_sales: 0,
      total_tax: 0,
      total_discount: 0,
      subtotal: 0
    };

    for (const row of result.rows) {
      totals.total_transactions += parseInt(row.total_transactions);
      totals.total_sales += parseFloat(row.total_sales || 0);
      totals.total_tax += parseFloat(row.total_tax || 0);
      totals.total_discount += parseFloat(row.total_discount || 0);
      totals.subtotal += parseFloat(row.subtotal || 0);
    }

    return {
      success: true,
      data: {
        daily: result.rows.map(row => ({
          date: row.date,
          transactions: parseInt(row.total_transactions),
          sales: parseFloat(row.total_sales),
          tax: parseFloat(row.total_tax),
          discount: parseFloat(row.total_discount)
        })),
        totals
      }
    };
  } catch (error) {
    console.error('❌ Error en getWeeklySales:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener resumen de inventario
 */
const getInventorySummary = async (businessId) => {
  try {
    const result = await db.query(
      `SELECT 
        COUNT(p.id) as total_products,
        SUM(i.current_stock) as total_stock,
        SUM(i.current_stock * p.sale_price) as total_inventory_value,
        COUNT(CASE WHEN i.current_stock <= p.min_stock THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN i.current_stock = 0 THEN 1 END) as out_of_stock_items
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.business_id = $1
       AND p.is_active = true`,
      [businessId]
    );

    const data = result.rows[0];

    return {
      success: true,
      data: {
        totalProducts: parseInt(data.total_products),
        totalStock: parseInt(data.total_stock || 0),
        totalInventoryValue: parseFloat(data.total_inventory_value || 0),
        lowStockItems: parseInt(data.low_stock_items || 0),
        outOfStockItems: parseInt(data.out_of_stock_items || 0)
      }
    };
  } catch (error) {
    console.error('❌ Error en getInventorySummary:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener top 10 productos más vendidos
 */
const getTopProducts = async (businessId, limit = 10) => {
  try {
    const result = await db.query(
      `SELECT 
        p.id,
        p.name,
        p.sku,
        COUNT(si.id) as times_sold,
        SUM(si.quantity) as total_quantity_sold,
        SUM(si.subtotal) as total_revenue,
        p.sale_price,
        i.current_stock
       FROM products p
       LEFT JOIN sale_items si ON p.id = si.product_id
       LEFT JOIN sales s ON si.sale_id = s.id
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.business_id = $1
       AND p.is_active = true
       AND (s.business_id = $1 OR s.id IS NULL)
       GROUP BY p.id, p.name, p.sku, p.sale_price, i.current_stock
       ORDER BY total_quantity_sold DESC
       LIMIT $2`,
      [businessId, limit]
    );

    return {
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        timesSold: parseInt(row.times_sold || 0),
        totalQuantitySold: parseInt(row.total_quantity_sold || 0),
        totalRevenue: parseFloat(row.total_revenue || 0),
        salePrice: parseFloat(row.sale_price),
        currentStock: parseInt(row.current_stock || 0)
      }))
    };
  } catch (error) {
    console.error('❌ Error en getTopProducts:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener productos con bajo stock
 */
const getLowStockProducts = async (businessId) => {
  try {
    const result = await db.query(
      `SELECT 
        p.id,
        p.name,
        p.sku,
        p.min_stock,
        i.current_stock,
        p.cost_price,
        p.sale_price,
        CASE 
          WHEN i.current_stock = 0 THEN 'AGOTADO'
          WHEN i.current_stock <= p.min_stock THEN 'BAJO'
          ELSE 'NORMAL'
        END as status
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.business_id = $1
       AND p.is_active = true
       AND i.current_stock <= p.min_stock
       ORDER BY i.current_stock ASC`,
      [businessId]
    );

    return {
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        sku: row.sku,
        minStock: row.min_stock,
        currentStock: parseInt(row.current_stock || 0),
        costPrice: parseFloat(row.cost_price),
        salePrice: parseFloat(row.sale_price),
        status: row.status
      }))
    };
  } catch (error) {
    console.error('❌ Error en getLowStockProducts:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener métricas generales del negocio
 */
const getBusinessMetrics = async (businessId) => {
  try {
    // Ventas totales
    const salesResult = await db.query(
      `SELECT 
        COUNT(*) as total_sales,
        SUM(total) as total_revenue,
        AVG(total) as avg_sale
       FROM sales
       WHERE business_id = $1 AND status = 'completed'`,
      [businessId]
    );

    // Productos vendidos
    const productsResult = await db.query(
      `SELECT COUNT(DISTINCT product_id) as products_sold
       FROM sale_items si
       JOIN sales s ON si.sale_id = s.id
       WHERE s.business_id = $1`,
      [businessId]
    );

    // Clientes únicos
    const customersResult = await db.query(
      `SELECT COUNT(DISTINCT customer_name) as unique_customers
       FROM sales
       WHERE business_id = $1`,
      [businessId]
    );

    return {
      success: true,
      data: {
        totalSales: parseInt(salesResult.rows[0].total_sales),
        totalRevenue: parseFloat(salesResult.rows[0].total_revenue || 0),
        averageSale: parseFloat(salesResult.rows[0].avg_sale || 0),
        productsSold: parseInt(productsResult.rows[0].products_sold || 0),
        uniqueCustomers: parseInt(customersResult.rows[0].unique_customers || 0)
      }
    };
  } catch (error) {
    console.error('❌ Error en getBusinessMetrics:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  getDailySales,
  getWeeklySales,
  getInventorySummary,
  getTopProducts,
  getLowStockProducts,
  getBusinessMetrics
};
