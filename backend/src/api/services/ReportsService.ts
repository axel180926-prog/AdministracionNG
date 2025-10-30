import pool from '../../config/database';

export class ReportsService {
  // Reporte de ventas por período
  static async getSalesReport(businessId: number, dateFrom: string, dateTo: string) {
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT so.id) as total_sales,
        SUM(so.total_amount) as total_revenue,
        AVG(so.total_amount) as average_sale,
        MIN(so.total_amount) as min_sale,
        MAX(so.total_amount) as max_sale,
        COUNT(soi.id) as total_items_sold
      FROM sales_orders so
      LEFT JOIN sales_order_items soi ON so.id = soi.sales_order_id
      WHERE so.business_id = $1
      AND so.created_at >= $2
      AND so.created_at <= $3`,
      [businessId, dateFrom, dateTo]
    );

    return result.rows[0];
  }

  // Reporte de ventas por categoría
  static async getSalesByCategory(businessId: number, dateFrom: string, dateTo: string) {
    const result = await pool.query(
      `SELECT 
        p.category,
        COUNT(soi.id) as quantity_sold,
        SUM(soi.subtotal) as revenue,
        AVG(p.price) as avg_price
      FROM sales_order_items soi
      JOIN products p ON soi.product_id = p.id
      JOIN sales_orders so ON soi.sales_order_id = so.id
      WHERE so.business_id = $1
      AND so.created_at >= $2
      AND so.created_at <= $3
      GROUP BY p.category
      ORDER BY revenue DESC`,
      [businessId, dateFrom, dateTo]
    );

    return result.rows;
  }

  // Top productos vendidos
  static async getTopProducts(businessId: number, dateFrom: string, dateTo: string, limit: number = 10) {
    const result = await pool.query(
      `SELECT 
        p.id,
        p.name,
        COUNT(soi.id) as quantity_sold,
        SUM(soi.subtotal) as revenue,
        AVG(p.price) as avg_price
      FROM sales_order_items soi
      JOIN products p ON soi.product_id = p.id
      JOIN sales_orders so ON soi.sales_order_id = so.id
      WHERE so.business_id = $1
      AND so.created_at >= $2
      AND so.created_at <= $3
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT $4`,
      [businessId, dateFrom, dateTo, limit]
    );

    return result.rows;
  }

  // Reporte de inventario
  static async getInventoryReport(businessId: number) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_products,
        SUM(stock) as total_units,
        SUM(stock * price) as total_value,
        COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN stock <= min_stock THEN 1 END) as low_stock,
        AVG(stock) as avg_stock
      FROM products
      WHERE business_id = $1`,
      [businessId]
    );

    return result.rows[0];
  }

  // Productos con bajo stock
  static async getLowStockReport(businessId: number) {
    const result = await pool.query(
      `SELECT 
        id,
        name,
        stock,
        min_stock,
        price,
        (min_stock - stock) as shortage
      FROM products
      WHERE business_id = $1
      AND stock <= min_stock
      ORDER BY shortage DESC`,
      [businessId]
    );

    return result.rows;
  }

  // Movimientos de inventario
  static async getInventoryMovements(businessId: number, dateFrom: string, dateTo: string, limit: number = 100) {
    const result = await pool.query(
      `SELECT 
        im.id,
        im.type,
        im.quantity,
        p.name as product_name,
        im.notes,
        im.created_at
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      WHERE im.business_id = $1
      AND im.created_at >= $2
      AND im.created_at <= $3
      ORDER BY im.created_at DESC
      LIMIT $4`,
      [businessId, dateFrom, dateTo, limit]
    );

    return result.rows;
  }

  // Dashboard summary
  static async getDashboardSummary(businessId: number) {
    const [salesResult, inventoryResult, productsResult] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) as count FROM sales_orders 
         WHERE business_id = $1 
         AND created_at >= NOW() - INTERVAL '30 days'`,
        [businessId]
      ),
      pool.query(
        `SELECT SUM(stock * price) as value FROM products WHERE business_id = $1`,
        [businessId]
      ),
      pool.query(
        `SELECT COUNT(*) as count FROM products WHERE business_id = $1`,
        [businessId]
      ),
    ]);

    return {
      sales_last_30_days: parseInt(salesResult.rows[0].count),
      inventory_value: inventoryResult.rows[0].value || 0,
      total_products: parseInt(productsResult.rows[0].count),
    };
  }

  // Reporte diario
  static async getDailyReport(businessId: number, date: string) {
    const result = await pool.query(
      `SELECT 
        DATE(so.created_at) as date,
        COUNT(so.id) as sales_count,
        SUM(so.total_amount) as daily_revenue,
        COUNT(DISTINCT so.customer_name) as customers
      FROM sales_orders so
      WHERE so.business_id = $1
      AND DATE(so.created_at) = $2
      GROUP BY DATE(so.created_at)`,
      [businessId, date]
    );

    return result.rows[0] || null;
  }

  // Ventas por método de pago
  static async getSalesByPaymentMethod(businessId: number, dateFrom: string, dateTo: string) {
    const result = await pool.query(
      `SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM sales_orders
      WHERE business_id = $1
      AND created_at >= $2
      AND created_at <= $3
      GROUP BY payment_method
      ORDER BY total DESC`,
      [businessId, dateFrom, dateTo]
    );

    return result.rows;
  }
}
