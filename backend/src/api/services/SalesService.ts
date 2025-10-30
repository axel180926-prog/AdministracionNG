import pool from '../../config/database';

export class SalesService {
  static async getSalesByBusiness(businessId: number, page: number = 1, limit: number = 10, dateFrom?: string, dateTo?: string) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT so.*, COUNT(soi.id) as item_count, SUM(soi.subtotal) as total_amount
      FROM sales_orders so
      LEFT JOIN sales_order_items soi ON so.id = soi.sales_order_id
      WHERE so.business_id = $1
    `;
    const params: any[] = [businessId];
    let paramCount = 1;

    if (dateFrom) {
      paramCount++;
      query += ` AND so.created_at >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      query += ` AND so.created_at <= $${paramCount}`;
      params.push(dateTo);
    }

    query += ` GROUP BY so.id ORDER BY so.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(DISTINCT so.id) FROM sales_orders so WHERE so.business_id = $1';
    const countParams: any[] = [businessId];
    if (dateFrom) countQuery += ` AND so.created_at >= $2`;
    if (dateTo) countQuery += ` AND so.created_at <= ${dateFrom ? '$3' : '$2'}`;

    if (dateFrom) countParams.push(dateFrom);
    if (dateTo) countParams.push(dateTo);

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return { data: result.rows, total, page, limit };
  }

  static async createSale(businessId: number, saleData: any) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const { customer_name, customer_phone, items, payment_method, notes } = saleData;
      
      // Calcular total
      let total = 0;
      for (const item of items) {
        total += item.subtotal;
      }

      // Insertar venta
      const saleResult = await client.query(
        `INSERT INTO sales_orders (business_id, customer_name, customer_phone, total_amount, status, payment_method, notes, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING *`,
        [businessId, customer_name, customer_phone, total, 'completed', payment_method, notes || null]
      );

      const saleId = saleResult.rows[0].id;

      // Insertar items de venta
      for (const item of items) {
        const { product_id, quantity, unit_price, subtotal } = item;

        // Insertar item
        await client.query(
          `INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [saleId, product_id, quantity, unit_price, subtotal]
        );

        // Restar del inventario
        await client.query(
          `UPDATE products SET stock = stock - $1, updated_at = NOW()
           WHERE id = $2 AND business_id = $3`,
          [quantity, product_id, businessId]
        );

        // Registrar movimiento de inventario
        await client.query(
          `INSERT INTO inventory_movements (business_id, product_id, type, quantity, reference_type, reference_id, notes, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
          [businessId, product_id, 'OUT', quantity, 'SALE', saleId, `Venta #${saleId}`]
        );
      }

      await client.query('COMMIT');
      return saleResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateSaleStatus(businessId: number, saleId: number, status: string) {
    const result = await pool.query(
      `UPDATE sales_orders SET status = $1, updated_at = NOW()
       WHERE id = $2 AND business_id = $3
       RETURNING *`,
      [status, saleId, businessId]
    );

    return result.rows[0];
  }

  static async getSaleById(businessId: number, saleId: number) {
    const result = await pool.query(
      `SELECT * FROM sales_orders WHERE id = $1 AND business_id = $2`,
      [saleId, businessId]
    );

    if (!result.rows[0]) return null;

    const sale = result.rows[0];

    // Obtener items
    const itemsResult = await pool.query(
      `SELECT soi.*, p.name, p.category FROM sales_order_items soi
       JOIN products p ON soi.product_id = p.id
       WHERE soi.sales_order_id = $1`,
      [saleId]
    );

    sale.items = itemsResult.rows;
    return sale;
  }

  static async getSalesReport(businessId: number, dateFrom: string, dateTo: string) {
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT so.id) as total_sales,
        SUM(so.total_amount) as total_revenue,
        AVG(so.total_amount) as average_sale,
        COUNT(soi.id) as total_items
      FROM sales_orders so
      LEFT JOIN sales_order_items soi ON so.id = soi.sales_order_id
      WHERE so.business_id = $1
      AND so.created_at >= $2
      AND so.created_at <= $3`,
      [businessId, dateFrom, dateTo]
    );

    return result.rows[0];
  }
}
