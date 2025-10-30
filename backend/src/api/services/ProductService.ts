import pool from '../../config/database';

export class ProductService {
  static async getProductsByBusiness(businessId: number, page: number = 1, limit: number = 10, search?: string, category?: string) {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM products WHERE business_id = $1';
    const params: any[] = [businessId];
    let countParam = 1;

    if (search) {
      countParam++;
      query += ` AND (name ILIKE $${countParam} OR description ILIKE $${countParam})`;
      params.push(`%${search}%`);
    }

    if (category) {
      countParam++;
      query += ` AND category = $${countParam}`;
      params.push(category);
    }

    query += ` ORDER BY created_at DESC LIMIT $${countParam + 1} OFFSET $${countParam + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) FROM products WHERE business_id = $1';
    const countParams: any[] = [businessId];
    if (search) {
      countQuery += ` AND (name ILIKE $2 OR description ILIKE $2)`;
      countParams.push(`%${search}%`);
    }
    if (category) {
      countQuery += ` AND category = ${search ? '$3' : '$2'}`;
      countParams.push(category);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return { data: result.rows, total, page, limit };
  }

  static async createProduct(businessId: number, productData: any) {
    const { name, description, price, stock, category, sku, min_stock } = productData;
    
    const result = await pool.query(
      `INSERT INTO products (business_id, name, description, price, stock, category, sku, min_stock, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
       RETURNING *`,
      [businessId, name, description, price, stock, category, sku || null, min_stock || 0]
    );

    return result.rows[0];
  }

  static async updateProduct(businessId: number, productId: number, productData: any) {
    const { name, description, price, stock, category, sku, min_stock } = productData;
    
    const result = await pool.query(
      `UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category = $5, sku = $6, min_stock = $7, updated_at = NOW()
       WHERE id = $8 AND business_id = $9
       RETURNING *`,
      [name, description, price, stock, category, sku || null, min_stock || 0, productId, businessId]
    );

    return result.rows[0];
  }

  static async deleteProduct(businessId: number, productId: number) {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 AND business_id = $2 RETURNING id',
      [productId, businessId]
    );

    return result.rows.length > 0;
  }

  static async getProductById(businessId: number, productId: number) {
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND business_id = $2',
      [productId, businessId]
    );

    return result.rows[0];
  }
}
