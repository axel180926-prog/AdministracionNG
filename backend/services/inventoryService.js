const db = require('../config/database');

/**
 * Obtener stock actual de un producto
 */
const getCurrentStock = async (productId) => {
  try {
    const result = await db.query(
      'SELECT current_stock FROM inventory WHERE product_id = $1',
      [productId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Inventario no encontrado' };
    }

    return { success: true, stock: result.rows[0].current_stock };
  } catch (error) {
    console.error('❌ Error en getCurrentStock:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Validar si hay stock disponible
 */
const validateStockAvailable = async (productId, requiredQuantity) => {
  try {
    const stockResult = await db.query(
      'SELECT current_stock FROM inventory WHERE product_id = $1',
      [productId]
    );

    if (stockResult.rows.length === 0) {
      return { available: false, error: 'Producto no encontrado en inventario' };
    }

    const currentStock = stockResult.rows[0].current_stock;

    if (currentStock < requiredQuantity) {
      return {
        available: false,
        error: `Stock insuficiente. Disponible: ${currentStock}, Requerido: ${requiredQuantity}`
      };
    }

    return { available: true, currentStock };
  } catch (error) {
    console.error('❌ Error en validateStockAvailable:', error);
    return { available: false, error: error.message };
  }
};

/**
 * Actualizar stock después de una venta (usar dentro de transacción)
 * NO hace commit, el llamador es responsable de eso
 */
const updateStockAfterSale = async (client, productId, quantity, saleId) => {
  try {
    // Obtener stock actual
    const stockResult = await client.query(
      'SELECT current_stock FROM inventory WHERE product_id = $1 FOR UPDATE',
      [productId]
    );

    if (stockResult.rows.length === 0) {
      throw new Error('Producto no encontrado en inventario');
    }

    const previousStock = stockResult.rows[0].current_stock;
    const newStock = previousStock - quantity;

    if (newStock < 0) {
      throw new Error(`Stock insuficiente para producto ID ${productId}. Disponible: ${previousStock}, Requerido: ${quantity}`);
    }

    // Actualizar inventario
    await client.query(
      'UPDATE inventory SET current_stock = $1, last_updated = NOW() WHERE product_id = $2',
      [newStock, productId]
    );

    // Registrar movimiento
    await client.query(
      `INSERT INTO inventory_movements 
       (product_id, movement_type, quantity, previous_stock, new_stock, reference_id, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [productId, 'SALE', -quantity, previousStock, newStock, saleId, `Venta ID: ${saleId}`]
    );

    return { success: true, previousStock, newStock };
  } catch (error) {
    console.error('❌ Error en updateStockAfterSale:', error);
    throw error;
  }
};

/**
 * Devolver stock después de cancelar venta (usar dentro de transacción)
 */
const updateStockAfterCancel = async (client, productId, quantity, saleId) => {
  try {
    // Obtener stock actual
    const stockResult = await client.query(
      'SELECT current_stock FROM inventory WHERE product_id = $1 FOR UPDATE',
      [productId]
    );

    if (stockResult.rows.length === 0) {
      throw new Error('Producto no encontrado en inventario');
    }

    const previousStock = stockResult.rows[0].current_stock;
    const newStock = previousStock + quantity; // Devolver el stock

    // Actualizar inventario
    await client.query(
      'UPDATE inventory SET current_stock = $1, last_updated = NOW() WHERE product_id = $2',
      [newStock, productId]
    );

    // Registrar movimiento
    await client.query(
      `INSERT INTO inventory_movements 
       (product_id, movement_type, quantity, previous_stock, new_stock, reference_id, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [productId, 'SALE_CANCEL', quantity, previousStock, newStock, saleId, `Cancelación de venta ID: ${saleId}`]
    );

    return { success: true, previousStock, newStock };
  } catch (error) {
    console.error('❌ Error en updateStockAfterCancel:', error);
    throw error;
  }
};

/**
 * Registrar movimiento de inventario manual
 */
const registerMovement = async (productId, movementType, quantity, notes = '') => {
  try {
    // Validar cantidad
    if (quantity === 0) {
      return { success: false, error: 'La cantidad debe ser diferente de 0' };
    }

    // Obtener stock actual
    const stockResult = await db.query(
      'SELECT current_stock FROM inventory WHERE product_id = $1',
      [productId]
    );

    if (stockResult.rows.length === 0) {
      return { success: false, error: 'Producto no encontrado en inventario' };
    }

    const previousStock = stockResult.rows[0].current_stock;
    const newStock = previousStock + quantity; // quantity puede ser negativo

    if (newStock < 0) {
      return { success: false, error: `Stock no puede ser negativo. Disponible: ${previousStock}` };
    }

    // Actualizar
    await db.query(
      'UPDATE inventory SET current_stock = $1, last_updated = NOW() WHERE product_id = $2',
      [newStock, productId]
    );

    // Registrar movimiento
    await db.query(
      `INSERT INTO inventory_movements 
       (product_id, movement_type, quantity, previous_stock, new_stock, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [productId, movementType, quantity, previousStock, newStock, notes]
    );

    return {
      success: true,
      movement: {
        productId,
        movementType,
        quantity,
        previousStock,
        newStock
      }
    };
  } catch (error) {
    console.error('❌ Error en registerMovement:', error);
    return { success: false, error: error.message };
  }
}
/**
 * Obtener historial de movimientos de un producto
 */
const getMovementHistory = async (businessId, productId, limit = 20, offset = 0) => {
  try {
    const result = await db.query(
      `SELECT im.* FROM inventory_movements im
       JOIN products p ON im.product_id = p.id
       WHERE im.product_id = $1 AND p.business_id = $2
       ORDER BY im.created_at DESC
       LIMIT $3 OFFSET $4`,
      [productId, businessId, limit, offset]
    );

    return {
      success: true,
      movements: result.rows
    };
  } catch (error) {
    console.error('❌ Error en getMovementHistory:', error);
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
        p.id,
        p.name,
        p.sku,
        i.current_stock,
        p.min_stock,
        (p.sale_price * i.current_stock) as total_value,
        CASE 
          WHEN i.current_stock <= p.min_stock THEN 'BAJO'
          WHEN i.current_stock <= p.min_stock * 2 THEN 'MEDIO'
          ELSE 'ALTO'
        END as stock_level
       FROM inventory i
       JOIN products p ON i.product_id = p.id
       WHERE p.business_id = $1 AND p.is_active = true
       ORDER BY i.current_stock ASC`,
      [businessId]
    );

    const totalValue = result.rows.reduce((sum, item) => sum + (item.total_value || 0), 0);
    const lowStockItems = result.rows.filter(item => item.stock_level === 'BAJO').length;

    return {
      success: true,
      summary: {
        totalItems: result.rows.length,
        totalValue,
        lowStockItems,
        items: result.rows
      }
    };
  } catch (error) {
    console.error('❌ Error en getInventorySummary:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  getCurrentStock,
  validateStockAvailable,
  updateStockAfterSale,
  updateStockAfterCancel,
  registerMovement,
  getMovementHistory,
  getInventorySummary
};
