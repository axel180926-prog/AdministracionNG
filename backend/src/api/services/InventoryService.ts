import pool from '../../config/database';

export class InventoryService {
  static async getInventoryByBusiness(businessId: number, page: number = 1, limit: number = 10, lowStockOnly: boolean = false) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT p.*, (p.stock <= p.min_stock) as is_low_stock
      FROM products p
      WHERE p.business_id = $1
    `;
    const params: any[] = [businessId];

    if (lowStockOnly) {
      query += ` AND p.stock <= p.min_stock`;
    }

    query += ` ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) FROM products WHERE business_id = $1';
    const countParams: any[] = [businessId];
    
    if (lowStockOnly) {
      countQuery += ` AND stock <= min_stock`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return { data: result.rows, total, page, limit };
  }

  static async addStock(businessId: number, productId: number, quantity: number, notes?: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Actualizar stock
      const result = await client.query(
        `UPDATE products SET stock = stock + $1, updated_at = NOW()
         WHERE id = $2 AND business_id = $3
         RETURNING *`,
        [quantity, productId, businessId]
      );

      if (result.rows.length === 0) {
        throw new Error('Producto no encontrado');
      }

      // Registrar movimiento
      await client.query(
        `INSERT INTO inventory_movements (business_id, product_id, type, quantity, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [businessId, productId, 'IN', quantity, notes || 'Entrada manual de stock']
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async removeStock(businessId: number, productId: number, quantity: number, reason?: string) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Verificar que hay stock suficiente
      const stockResult = await client.query(
        'SELECT stock FROM products WHERE id = $1 AND business_id = $2',
        [productId, businessId]
      );

      if (stockResult.rows.length === 0) {
        throw new Error('Producto no encontrado');
      }

      if (stockResult.rows[0].stock < quantity) {
        throw new Error('Stock insuficiente');
      }

      // Actualizar stock
      const result = await client.query(
        `UPDATE products SET stock = stock - $1, updated_at = NOW()
         WHERE id = $2 AND business_id = $3
         RETURNING *`,
        [quantity, productId, businessId]
      );

      // Registrar movimiento
      await client.query(
        `INSERT INTO inventory_movements (business_id, product_id, type, quantity, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [businessId, productId, 'OUT', quantity, reason || 'Salida manual de stock']
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getMovementHistory(businessId: number, productId?: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    let query = `
      SELECT im.*, p.name as product_name
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      WHERE im.business_id = $1
    `;
    const params: any[] = [businessId];
    let paramCount = 1;

    if (productId) {
      paramCount++;
      query += ` AND im.product_id = $${paramCount}`;
      params.push(productId);
    }

    query += ` ORDER BY im.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) FROM inventory_movements WHERE business_id = $1';
    const countParams: any[] = [businessId];
    if (productId) {
      countQuery += ` AND product_id = $2`;
      countParams.push(productId);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return { data: result.rows, total, page, limit };
  }

  static async getLowStockProducts(businessId: number) {
    const result = await pool.query(
      `SELECT * FROM products
       WHERE business_id = $1 AND stock <= min_stock
       ORDER BY stock ASC`,
      [businessId]
    );

    return result.rows;
  }

  static async getInventorySummary(businessId: number) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_products,
        SUM(stock) as total_units,
        SUM(stock * price) as total_value,
        COUNT(CASE WHEN stock <= min_stock THEN 1 END) as low_stock_count
      FROM products
      WHERE business_id = $1`,
      [businessId]
    );

    return result.rows[0];
  }
}
