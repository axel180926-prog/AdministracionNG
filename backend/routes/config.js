const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// Obtener configuración completa del negocio
router.get('/business-config', authenticateToken, async (req, res) => {
  try {
    // 1. Obtener configuración del negocio
    const settingsResult = await db.query(
      `SELECT 
         bs.*,
         bt.name as business_type_name,
         bt.display_name as business_type_display,
         bt.icon as business_type_icon,
         b.name as business_name
       FROM business_settings bs
       JOIN businesses b ON bs.business_id = b.id
       LEFT JOIN business_types bt ON bs.business_type_id = bt.id
       WHERE bs.business_id = $1`,
      [req.user.businessId]
    );
    
    if (settingsResult.rows.length === 0) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    
    const settings = settingsResult.rows[0];
    
    // 2. Obtener módulos activos
    const modulesResult = await db.query(
      `SELECT 
         m.id,
         m.code,
         m.name,
         m.description,
         m.icon,
         m.category,
         bm.is_active,
         bm.custom_settings
       FROM business_modules bm
       JOIN modules m ON bm.module_id = m.id
       WHERE bm.business_id = $1
       ORDER BY m.category, m.id`,
      [req.user.businessId]
    );
    
    // 3. Agrupar módulos por categoría
    const modulesByCategory = {};
    modulesResult.rows.forEach(module => {
      if (!modulesByCategory[module.category]) {
        modulesByCategory[module.category] = [];
      }
      modulesByCategory[module.category].push(module);
    });
    
    res.json({
      business: {
        id: req.user.businessId,
        name: settings.business_name,
        type: {
          name: settings.business_type_name,
          display: settings.business_type_display,
          icon: settings.business_type_icon
        }
      },
      settings: {
        colors: {
          primary: settings.primary_color,
          secondary: settings.secondary_color
        },
        logo: settings.logo_url,
        currency: settings.currency,
        timezone: settings.timezone,
        tax: {
          enabled: settings.enable_tax,
          rate: settings.tax_rate
        },
        features: {
          tables: settings.table_count > 0,
          delivery: settings.enable_delivery,
          loyaltyPoints: settings.enable_loyalty_points,
          reservations: settings.enable_table_reservation
        },
        operational: {
          tableCount: settings.table_count,
          deliveryRadius: settings.delivery_radius_km,
          pointsPerPeso: settings.points_per_peso,
          businessHours: settings.business_hours
        }
      },
      modules: modulesByCategory,
      enabledModules: modulesResult.rows.filter(m => m.is_active).map(m => m.code)
    });
    
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obtener todos los tipos de negocio
router.get('/business-types', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM business_types ORDER BY display_name`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activar/desactivar módulo
router.post('/toggle-module', authenticateToken, checkPermission(['owner', 'admin']), async (req, res) => {
  const { module_code, is_active } = req.body;
  
  try {
    // Verificar si el módulo es requerido
    const checkResult = await db.query(
      `SELECT btm.is_required
       FROM business_type_modules btm
       JOIN modules m ON btm.module_id = m.id
       JOIN business_settings bs ON btm.business_type_id = bs.business_type_id
       WHERE m.code = $1 AND bs.business_id = $2`,
      [module_code, req.user.businessId]
    );
    
    if (checkResult.rows.length > 0 && checkResult.rows[0].is_required && !is_active) {
      return res.status(400).json({ 
        error: 'Este módulo es obligatorio y no puede desactivarse' 
      });
    }
    
    // Actualizar estado del módulo
    await db.query(
      `UPDATE business_modules bm
       SET is_active = $1, updated_at = NOW()
       FROM modules m
       WHERE bm.module_id = m.id 
         AND m.code = $2 
         AND bm.business_id = $3`,
      [is_active, module_code, req.user.businessId]
    );
    
    res.json({ 
      success: true, 
      message: `Módulo ${is_active ? 'activado' : 'desactivado'} correctamente` 
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar configuración del negocio
router.put('/business-settings', authenticateToken, checkPermission(['owner', 'admin']), async (req, res) => {
  const {
    primary_color,
    secondary_color,
    enable_tax,
    tax_rate,
    enable_delivery,
    delivery_radius_km,
    enable_loyalty_points,
    points_per_peso,
    table_count,
    business_hours
  } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE business_settings
       SET 
         primary_color = COALESCE($1, primary_color),
         secondary_color = COALESCE($2, secondary_color),
         enable_tax = COALESCE($3, enable_tax),
         tax_rate = COALESCE($4, tax_rate),
         enable_delivery = COALESCE($5, enable_delivery),
         delivery_radius_km = COALESCE($6, delivery_radius_km),
         enable_loyalty_points = COALESCE($7, enable_loyalty_points),
         points_per_peso = COALESCE($8, points_per_peso),
         table_count = COALESCE($9, table_count),
         business_hours = COALESCE($10::jsonb, business_hours),
         updated_at = NOW()
       WHERE business_id = $11
       RETURNING *`,
      [
        primary_color,
        secondary_color,
        enable_tax,
        tax_rate,
        enable_delivery,
        delivery_radius_km,
        enable_loyalty_points,
        points_per_peso,
        table_count,
        business_hours ? JSON.stringify(business_hours) : null,
        req.user.businessId
      ]
    );
    
    res.json({
      success: true,
      settings: result.rows[0],
      message: 'Configuración actualizada correctamente'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
