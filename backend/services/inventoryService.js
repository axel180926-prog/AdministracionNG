const db = require('../config/database');

class InventoryService {
  
  // Actualizar inventario después de una venta
  async updateStockAfterSale(saleItems, userId) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      for (const item of saleItems) {
        // Obtener stock actual
        const stockResult = await client.query(
          'SELECT current_stock FROM inventory WHERE product_id = $1',
          [item.product_id]
        );
        
        if (stockResult.rows.length === 0) {
          throw new Error(`Producto ${item.product_id} no tiene inventario`);
        }
        
        const currentStock = stockResult.rows[0].current_stock;
        const newStock = currentStock - item.quantity;
        
        if (newStock < 0) {
          const productResult = await client.query(
            'SELECT name FROM products WHERE id = $1',
            [item.product_id]
          );
          throw new Error(
            `❌ Stock insuficiente para ${productResult.rows[0].name}. ` +
            `Disponible: ${currentStock}, Solicitado: ${item.quantity}`
          );
        }
        
        // Actualizar inventario
        await client.query(
          `UPDATE inventory 
           SET current_stock = $1, last_updated = NOW() 
           WHERE product_id = $2`,
          [newStock, item.product_id]
        );
        
        // Registrar movimiento
        await client.query(
          `INSERT INTO inventory_movements 
           (product_id, user_id, movement_type, quantity, previous_stock, new_stock, reference_id, notes)
           VALUES ($1, $2, 'sale', $3, $4, $5, $6, 'Venta automática')`,
          [item.product_id, userId, item.quantity, currentStock, newStock, item.sale_id]
        );
      }
      
      await client.query('COMMIT');
      return { success: true };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Agregar stock (entrada de inventario)
  async addStock(productId, quantity, userId, notes = '') {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const stockResult = await client.query(
        'SELECT current_stock FROM inventory WHERE product_id = $1',
        [productId]
      );
      
      let currentStock = 0;
      if (stockResult.rows.length > 0) {
        currentStock = stockResult.rows[0].current_stock;
        
        await client.query(
          `UPDATE inventory 
           SET current_stock = current_stock + $1, 
               last_restock_date = NOW(),
               last_updated = NOW()
           WHERE product_id = $2`,
          [quantity, productId]
        );
      } else {
        await client.query(
          `INSERT INTO inventory (product_id, current_stock, last_restock_date)
           VALUES ($1, $2, NOW())`,
          [productId, quantity]
        );
      }
      
      const newStock = currentStock + quantity;
      
      await client.query(
        `INSERT INTO inventory_movements 
         (product_id, user_id, movement_type, quantity, previous_stock, new_stock, notes)
         VALUES ($1, $2, 'entry', $3, $4, $5, $6)`,
        [productId, userId, quantity, currentStock, newStock, notes]
      );
      
      await client.query('COMMIT');
      return { success: true, newStock };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  // Obtener productos con stock bajo
  async getLowStockProducts(businessId) {
    const result = await db.query(
      `SELECT 
         p.id,
         p.name,
         p.sku,
         i.current_stock,
         p.min_stock,
         c.name as category
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.business_id = $1 
         AND p.is_active = true
         AND i.current_stock <= p.min_stock
       ORDER BY i.current_stock ASC`,
      [businessId]
    );
    
    return result.rows;
  }
  
  // Reporte de inventario semanal
  async getWeeklyInventoryReport(businessId) {
    const result = await db.query(
      `SELECT 
         p.name,
         p.sku,
         c.name as category,
         i.current_stock,
         p.min_stock,
         COALESCE(SUM(CASE WHEN im.movement_type = 'sale' THEN im.quantity ELSE 0 END), 0) as sold_this_week,
         COALESCE(SUM(CASE WHEN im.movement_type = 'entry' THEN im.quantity ELSE 0 END), 0) as added_this_week,
         p.sale_price,
         COALESCE(SUM(CASE WHEN im.movement_type = 'sale' THEN im.quantity ELSE 0 END), 0) * p.sale_price as revenue_this_week
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN inventory_movements im ON p.id = im.product_id 
         AND im.created_at >= NOW() - INTERVAL '7 days'
       WHERE p.business_id = $1 AND p.is_active = true
       GROUP BY p.id, p.name, p.sku, c.name, i.current_stock, p.min_stock, p.sale_price
       ORDER BY sold_this_week DESC`,
      [businessId]
    );
    
    return result.rows;
  }
}

module.exports = new InventoryService();
