const db = require('../config/database');
const inventoryService = require('./inventoryService');

/**
 * Crear una nueva venta CON TRANSACCIÓN ACID
 * CRÍTICO: Verifica stock, actualiza inventario, registra movimientos en una sola transacción
 */
const createSale = async (businessId, userId, saleData) => {
  const client = await db.pool.connect();

  try {
    // Validar datos
    if (!saleData.items || saleData.items.length === 0) {
      return { success: false, error: 'La venta debe tener al menos un item' };
    }

    // INICIO DE TRANSACCIÓN
    await client.query('BEGIN');

    try {
      // 1️⃣ Validar que todos los productos existen y tienen stock suficiente
      for (const item of saleData.items) {
        const productResult = await client.query(
          'SELECT id, name, sale_price FROM products WHERE id = $1 AND business_id = $2 AND is_active = true',
          [item.productId, businessId]
        );

        if (productResult.rows.length === 0) {
          throw new Error(`Producto ID ${item.productId} no encontrado`);
        }

        // Validar stock disponible
        const stockResult = await client.query(
          'SELECT current_stock FROM inventory WHERE product_id = $1 FOR UPDATE',
          [item.productId]
        );

        if (stockResult.rows.length === 0) {
          throw new Error(`Inventario no encontrado para producto ID ${item.productId}`);
        }

        if (stockResult.rows[0].current_stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para ${productResult.rows[0].name}. ` +
            `Disponible: ${stockResult.rows[0].current_stock}, Requerido: ${item.quantity}`
          );
        }
      }

      // 2️⃣ Calcular totales
      let subtotal = 0;
      for (const item of saleData.items) {
        const productResult = await client.query(
          'SELECT sale_price FROM products WHERE id = $1',
          [item.productId]
        );
        const price = productResult.rows[0].sale_price;
        subtotal += price * item.quantity;
      }

      const taxAmount = saleData.enableTax ? subtotal * (saleData.taxRate || 0) : 0;
      const discount = saleData.discount || 0;
      const total = subtotal + taxAmount - discount;

      // 3️⃣ Crear registro de venta
      const saleNumber = `SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const saleResult = await client.query(
        `INSERT INTO sales 
         (business_id, user_id, sale_number, subtotal, tax, discount, total, payment_method, customer_name, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         RETURNING id, sale_number, subtotal, tax, discount, total, created_at`,
        [
          businessId,
          userId,
          saleNumber,
          subtotal,
          taxAmount,
          discount,
          total,
          saleData.paymentMethod || 'cash',
          saleData.customerName || 'Cliente General',
          'completed'
        ]
      );

      const saleId = saleResult.rows[0].id;

      // 4️⃣ Crear items de venta y actualizar inventario
      const saleItems = [];
      for (const item of saleData.items) {
        // Obtener precio actual del producto
        const productResult = await client.query(
          'SELECT name, sale_price FROM products WHERE id = $1',
          [item.productId]
        );

        const productName = productResult.rows[0].name;
        const unitPrice = productResult.rows[0].sale_price;
        const itemSubtotal = unitPrice * item.quantity;

        // Insertar item de venta
        const itemResult = await client.query(
          `INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, subtotal, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           RETURNING id, product_id, product_name, quantity, unit_price, subtotal`,
          [saleId, item.productId, productName, item.quantity, unitPrice, itemSubtotal]
        );

        saleItems.push(itemResult.rows[0]);

        // Actualizar inventario (llama a inventoryService)
        await inventoryService.updateStockAfterSale(client, item.productId, item.quantity, saleId);
      }

      // 5️⃣ COMMIT - Todo salió bien
      await client.query('COMMIT');

      return {
        success: true,
        sale: {
          id: saleId,
          saleNumber: saleResult.rows[0].sale_number,
          businessId,
          subtotal: parseFloat(saleResult.rows[0].subtotal),
          tax: parseFloat(saleResult.rows[0].tax),
          discount: parseFloat(saleResult.rows[0].discount),
          total: parseFloat(saleResult.rows[0].total),
          items: saleItems,
          status: 'completed',
          createdAt: saleResult.rows[0].created_at
        }
      };
    } catch (transactionError) {
      // Error durante la transacción - ROLLBACK automático
      throw transactionError;
    }
  } catch (error) {
    console.error('❌ Error en createSale:', error);
    return {
      success: false,
      error: error.message || 'Error al crear venta'
    };
  } finally {
    client.release();
  }
};

/**
 * Obtener todas las ventas
 */
const getSales = async (businessId, { limit = 10, offset = 0, startDate, endDate } = {}) => {
  try {
    let query = 'SELECT * FROM sales WHERE business_id = $1';
    let params = [businessId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      query += ` AND created_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND created_at <= $${paramCount}`;
      params.push(endDate);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return {
      success: true,
      sales: result.rows.map(formatSale)
    };
  } catch (error) {
    console.error('❌ Error en getSales:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener venta por ID
 */
const getSaleById = async (businessId, saleId) => {
  try {
    // Obtener venta
    const saleResult = await db.query(
      'SELECT * FROM sales WHERE id = $1 AND business_id = $2',
      [saleId, businessId]
    );

    if (saleResult.rows.length === 0) {
      return { success: false, error: 'Venta no encontrada' };
    }

    const sale = saleResult.rows[0];

    // Obtener items
    const itemsResult = await db.query(
      'SELECT * FROM sale_items WHERE sale_id = $1',
      [saleId]
    );

    return {
      success: true,
      sale: {
        ...formatSale(sale),
        items: itemsResult.rows
      }
    };
  } catch (error) {
    console.error('❌ Error en getSaleById:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener ventas del día
 */
const getSalesToday = async (businessId) => {
  try {
    const result = await db.query(
      `SELECT * FROM sales 
       WHERE business_id = $1 
       AND DATE(created_at) = CURRENT_DATE
       ORDER BY created_at DESC`,
      [businessId]
    );

    return {
      success: true,
      sales: result.rows.map(formatSale)
    };
  } catch (error) {
    console.error('❌ Error en getSalesToday:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Cancelar una venta (devuelve stock)
 * CRÍTICO: Usa transacción para devolver stock
 */
const cancelSale = async (businessId, saleId) => {
  const client = await db.pool.connect();

  try {
    // Verificar que la venta existe
    const saleResult = await db.query(
      'SELECT * FROM sales WHERE id = $1 AND business_id = $2',
      [saleId, businessId]
    );

    if (saleResult.rows.length === 0) {
      return { success: false, error: 'Venta no encontrada' };
    }

    if (saleResult.rows[0].status === 'cancelled') {
      return { success: false, error: 'Esta venta ya fue cancelada' };
    }

    // INICIO DE TRANSACCIÓN
    await client.query('BEGIN');

    try {
      // Obtener items de la venta
      const itemsResult = await client.query(
        'SELECT * FROM sale_items WHERE sale_id = $1',
        [saleId]
      );

      // Devolver stock para cada item
      for (const item of itemsResult.rows) {
        await inventoryService.updateStockAfterCancel(client, item.product_id, item.quantity, saleId);
      }

      // Marcar venta como cancelada
      await client.query(
        'UPDATE sales SET status = $1 WHERE id = $2',
        ['cancelled', saleId]
      );

      // COMMIT
      await client.query('COMMIT');

      return {
        success: true,
        message: 'Venta cancelada exitosamente'
      };
    } catch (transactionError) {
      throw transactionError;
    }
  } catch (error) {
    console.error('❌ Error en cancelSale:', error);
    return { success: false, error: error.message };
  } finally {
    client.release();
  }
};

/**
 * Formatear venta para respuesta
 */
const formatSale = (sale) => {
  return {
    id: sale.id,
    saleNumber: sale.sale_number,
    businessId: sale.business_id,
    userId: sale.user_id,
    subtotal: parseFloat(sale.subtotal),
    tax: parseFloat(sale.tax),
    discount: parseFloat(sale.discount),
    total: parseFloat(sale.total),
    paymentMethod: sale.payment_method,
    customerName: sale.customer_name,
    status: sale.status,
    createdAt: sale.created_at
  };
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  getSalesToday,
  cancelSale
};
