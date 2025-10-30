const db = require('../config/database');

/**
 * Crear un nuevo producto
 */
const createProduct = async (businessId, { name, description, categoryId, sku, costPrice, salePrice, minStock = 5 }) => {
  try {
    // Validar campos requeridos
    if (!name || !salePrice) {
      return { success: false, error: 'Nombre y precio de venta son requeridos' };
    }

    // Validar precio > 0
    if (salePrice <= 0) {
      return { success: false, error: 'El precio de venta debe ser mayor a 0' };
    }

    if (costPrice && costPrice < 0) {
      return { success: false, error: 'El precio de costo no puede ser negativo' };
    }

    // Validar SKU único por business_id si se proporciona
    if (sku) {
      const existingSku = await db.query(
        'SELECT id FROM products WHERE sku = $1 AND business_id = $2',
        [sku, businessId]
      );
      if (existingSku.rows.length > 0) {
        return { success: false, error: 'El SKU ya existe para este negocio' };
      }
    }

    // Validar que categoryId existe para este business
    if (categoryId) {
      const category = await db.query(
        'SELECT id FROM categories WHERE id = $1 AND business_id = $2',
        [categoryId, businessId]
      );
      if (category.rows.length === 0) {
        return { success: false, error: 'La categoría no existe' };
      }
    }

    // Insertar producto
    const result = await db.query(
      `INSERT INTO products 
       (business_id, category_id, sku, name, description, cost_price, sale_price, min_stock, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
       RETURNING id, business_id, category_id, sku, name, description, cost_price, sale_price, min_stock, is_active, created_at, updated_at`,
      [businessId, categoryId || null, sku || null, name, description || null, costPrice || 0, salePrice, minStock, true]
    );

    const product = result.rows[0];

    // Crear registro en inventario
    await db.query(
      'INSERT INTO inventory (product_id, current_stock, last_updated) VALUES ($1, 0, NOW())',
      [product.id]
    );

    return {
      success: true,
      product: formatProduct(product)
    };
  } catch (error) {
    console.error('❌ Error en createProduct:', error);
    return { success: false, error: 'Error al crear producto: ' + error.message };
  }
};

/**
 * Obtener todos los productos de un negocio
 */
const getProducts = async (businessId, { limit = 10, offset = 0, search = '', categoryId = null, isActive = true } = {}) => {
  try {
    let query = `
      SELECT p.*, i.current_stock
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.business_id = $1 AND p.is_active = $2
    `;
    let params = [businessId, isActive];
    let paramCount = 2;

    // Filtrar por búsqueda (nombre o SKU)
    if (search) {
      paramCount++;
      query += ` AND (p.name ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Filtrar por categoría
    if (categoryId) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    // Contar total de registros
    const countQuery = query.replace('SELECT p.*,', 'SELECT COUNT(*) as count');
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Agregar paginación
    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    return {
      success: true,
      data: result.rows.map(formatProduct),
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('❌ Error en getProducts:', error);
    return { success: false, error: 'Error al obtener productos: ' + error.message };
  }
};

/**
 * Obtener un producto por ID
 */
const getProductById = async (businessId, productId) => {
  try {
    const result = await db.query(
      `SELECT p.*, i.current_stock
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.id = $1 AND p.business_id = $2`,
      [productId, businessId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Producto no encontrado' };
    }

    return {
      success: true,
      product: formatProduct(result.rows[0])
    };
  } catch (error) {
    console.error('❌ Error en getProductById:', error);
    return { success: false, error: 'Error al obtener producto: ' + error.message };
  }
};

/**
 * Actualizar un producto
 */
const updateProduct = async (businessId, productId, updates) => {
  try {
    // Obtener producto actual
    const currentResult = await db.query(
      'SELECT id FROM products WHERE id = $1 AND business_id = $2',
      [productId, businessId]
    );

    if (currentResult.rows.length === 0) {
      return { success: false, error: 'Producto no encontrado' };
    }

    // Validar campos si se proporcionan
    if (updates.name !== undefined && !updates.name) {
      return { success: false, error: 'El nombre no puede estar vacío' };
    }

    if (updates.salePrice !== undefined && updates.salePrice <= 0) {
      return { success: false, error: 'El precio de venta debe ser mayor a 0' };
    }

    if (updates.costPrice !== undefined && updates.costPrice < 0) {
      return { success: false, error: 'El precio de costo no puede ser negativo' };
    }

    // Validar SKU único si se actualiza
    if (updates.sku) {
      const skuResult = await db.query(
        'SELECT id FROM products WHERE sku = $1 AND business_id = $2 AND id != $3',
        [updates.sku, businessId, productId]
      );
      if (skuResult.rows.length > 0) {
        return { success: false, error: 'El SKU ya existe para otro producto en este negocio' };
      }
    }

    // Construir query dinámico
    let updateFields = [];
    let updateParams = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      updateParams.push(updates.name);
      paramCount++;
    }
    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      updateParams.push(updates.description);
      paramCount++;
    }
    if (updates.categoryId !== undefined) {
      updateFields.push(`category_id = $${paramCount}`);
      updateParams.push(updates.categoryId);
      paramCount++;
    }
    if (updates.sku !== undefined) {
      updateFields.push(`sku = $${paramCount}`);
      updateParams.push(updates.sku);
      paramCount++;
    }
    if (updates.costPrice !== undefined) {
      updateFields.push(`cost_price = $${paramCount}`);
      updateParams.push(updates.costPrice);
      paramCount++;
    }
    if (updates.salePrice !== undefined) {
      updateFields.push(`sale_price = $${paramCount}`);
      updateParams.push(updates.salePrice);
      paramCount++;
    }
    if (updates.minStock !== undefined) {
      updateFields.push(`min_stock = $${paramCount}`);
      updateParams.push(updates.minStock);
      paramCount++;
    }
    if (updates.isActive !== undefined) {
      updateFields.push(`is_active = $${paramCount}`);
      updateParams.push(updates.isActive);
      paramCount++;
    }

    // Si no hay campos para actualizar
    if (updateFields.length === 0) {
      return { success: false, error: 'No hay campos para actualizar' };
    }

    updateFields.push(`updated_at = NOW()`);
    updateParams.push(productId, businessId);

    const query = `
      UPDATE products
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount + 1} AND business_id = $${paramCount + 2}
      RETURNING id, business_id, category_id, sku, name, description, cost_price, sale_price, min_stock, is_active, created_at, updated_at
    `;

    const result = await db.query(query, updateParams);

    return {
      success: true,
      product: formatProduct(result.rows[0])
    };
  } catch (error) {
    console.error('❌ Error en updateProduct:', error);
    return { success: false, error: 'Error al actualizar producto: ' + error.message };
  }
};

/**
 * Eliminar (desactivar) un producto
 */
const deleteProduct = async (businessId, productId) => {
  try {
    // Verificar que el producto existe
    const result = await db.query(
      'SELECT id FROM products WHERE id = $1 AND business_id = $2',
      [productId, businessId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Producto no encontrado' };
    }

    // En lugar de eliminar, desactivar
    await db.query(
      'UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1',
      [productId]
    );

    return { success: true, message: 'Producto eliminado exitosamente' };
  } catch (error) {
    console.error('❌ Error en deleteProduct:', error);
    return { success: false, error: 'Error al eliminar producto: ' + error.message };
  }
};

/**
 * Obtener producto por SKU (útil para venta rápida)
 */
const getProductBySku = async (businessId, sku) => {
  try {
    const result = await db.query(
      `SELECT p.*, i.current_stock
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       WHERE p.sku = $1 AND p.business_id = $2 AND p.is_active = true`,
      [sku, businessId]
    );

    if (result.rows.length === 0) {
      return { success: false, error: 'Producto no encontrado' };
    }

    return {
      success: true,
      product: formatProduct(result.rows[0])
    };
  } catch (error) {
    console.error('❌ Error en getProductBySku:', error);
    return { success: false, error: 'Error al obtener producto: ' + error.message };
  }
};

/**
 * Formattear producto para respuesta
 */
const formatProduct = (product) => {
  return {
    id: product.id,
    businessId: product.business_id,
    categoryId: product.category_id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    costPrice: parseFloat(product.cost_price),
    salePrice: parseFloat(product.sale_price),
    minStock: product.min_stock,
    currentStock: product.current_stock || 0,
    isActive: product.is_active,
    createdAt: product.created_at,
    updatedAt: product.updated_at
  };
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductBySku
};
