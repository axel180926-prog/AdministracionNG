import pool from '../../config/database';

export class ConfigService {
  // Obtener configuración del negocio
  static async getBusinessConfig(businessId: number) {
    const result = await pool.query(
      'SELECT * FROM business_settings WHERE business_id = $1',
      [businessId]
    );

    return result.rows[0] || null;
  }

  // Obtener módulos activos
  static async getActiveModules(businessId: number) {
    const result = await pool.query(
      `SELECT m.id, m.code, m.name, m.icon, m.category, bm.is_active, bm.custom_settings
       FROM business_modules bm
       JOIN modules m ON bm.module_id = m.id
       WHERE bm.business_id = $1
       ORDER BY m.category, m.name`,
      [businessId]
    );

    return result.rows;
  }

  // Obtener todos los módulos disponibles
  static async getAvailableModules() {
    const result = await pool.query(
      'SELECT id, code, name, description, icon, category FROM modules ORDER BY category, name'
    );

    return result.rows;
  }

  // Activar/desactivar módulo
  static async toggleModule(businessId: number, moduleId: number, isActive: boolean) {
    const result = await pool.query(
      `UPDATE business_modules 
       SET is_active = $1, updated_at = NOW()
       WHERE business_id = $2 AND module_id = $3
       RETURNING *`,
      [isActive, businessId, moduleId]
    );

    return result.rows[0];
  }

  // Actualizar configuración del negocio
  static async updateBusinessConfig(businessId: number, config: any) {
    const {
      primary_color,
      secondary_color,
      logo_url,
      currency,
      timezone,
      tax_rate,
      enable_tax,
      table_count,
      enable_table_reservation,
      enable_delivery,
      delivery_radius_km,
      enable_loyalty_points,
      points_per_peso,
      business_hours,
    } = config;

    const result = await pool.query(
      `UPDATE business_settings 
       SET primary_color = COALESCE($1, primary_color),
           secondary_color = COALESCE($2, secondary_color),
           logo_url = COALESCE($3, logo_url),
           currency = COALESCE($4, currency),
           timezone = COALESCE($5, timezone),
           tax_rate = COALESCE($6, tax_rate),
           enable_tax = COALESCE($7, enable_tax),
           table_count = COALESCE($8, table_count),
           enable_table_reservation = COALESCE($9, enable_table_reservation),
           enable_delivery = COALESCE($10, enable_delivery),
           delivery_radius_km = COALESCE($11, delivery_radius_km),
           enable_loyalty_points = COALESCE($12, enable_loyalty_points),
           points_per_peso = COALESCE($13, points_per_peso),
           business_hours = COALESCE($14, business_hours),
           updated_at = NOW()
       WHERE business_id = $15
       RETURNING *`,
      [
        primary_color,
        secondary_color,
        logo_url,
        currency,
        timezone,
        tax_rate,
        enable_tax,
        table_count,
        enable_table_reservation,
        enable_delivery,
        delivery_radius_km,
        enable_loyalty_points,
        points_per_peso,
        business_hours,
        businessId,
      ]
    );

    return result.rows[0];
  }

  // Obtener información del negocio
  static async getBusinessInfo(businessId: number) {
    const result = await pool.query(
      `SELECT b.id, b.name, b.owner_name, b.phone, b.email, b.address, 
              b.business_type_id, b.subscription_plan, b.is_active, b.created_at,
              bt.name as business_type_name
       FROM businesses b
       LEFT JOIN business_types bt ON b.business_type_id = bt.id
       WHERE b.id = $1`,
      [businessId]
    );

    return result.rows[0] || null;
  }

  // Actualizar información del negocio
  static async updateBusinessInfo(businessId: number, info: any) {
    const { name, owner_name, phone, email, address } = info;

    const result = await pool.query(
      `UPDATE businesses 
       SET name = COALESCE($1, name),
           owner_name = COALESCE($2, owner_name),
           phone = COALESCE($3, phone),
           email = COALESCE($4, email),
           address = COALESCE($5, address),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [name, owner_name, phone, email, address, businessId]
    );

    return result.rows[0];
  }

  // Inicializar módulos por defecto para un negocio
  static async initializeModules(businessId: number, businessTypeId: number) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Obtener módulos por defecto para este tipo de negocio
      const modulesResult = await client.query(
        `SELECT m.id FROM modules m
         JOIN business_type_modules btm ON m.id = btm.module_id
         WHERE btm.business_type_id = $1`,
        [businessTypeId]
      );

      // Crear business_modules para cada uno
      for (const row of modulesResult.rows) {
        await client.query(
          `INSERT INTO business_modules (business_id, module_id, is_active)
           VALUES ($1, $2, true)
           ON CONFLICT DO NOTHING`,
          [businessId, row.id]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Obtener todas las categorías de módulos
  static async getModuleCategories() {
    const result = await pool.query(
      `SELECT DISTINCT category FROM modules WHERE category IS NOT NULL ORDER BY category`
    );

    return result.rows.map((r) => r.category);
  }

  // Obtener módulos por categoría
  static async getModulesByCategory(category: string) {
    const result = await pool.query(
      `SELECT id, code, name, description, icon FROM modules 
       WHERE category = $1 
       ORDER BY name`,
      [category]
    );

    return result.rows;
  }
}
