-- =====================================================
-- SEED INICIAL - Tipos de Negocio y Módulos
-- =====================================================

-- INSERTAR TIPOS DE NEGOCIO
INSERT INTO business_types (name, display_name, icon, description) VALUES
('restaurant', 'Restaurante', 'restaurant', 'Servicio de comida con mesas y meseros'),
('bakery', 'Panadería', 'bakery_dining', 'Venta de pan y productos horneados'),
('butcher', 'Carnicería', 'store', 'Venta de carnes y productos cárnicos'),
('chicken_shop', 'Pollería', 'egg', 'Venta de pollo y productos derivados'),
('tamale_shop', 'Tamalera', 'rice_bowl', 'Venta de tamales'),
('taqueria', 'Taquería', 'fastfood', 'Venta de tacos y antojitos'),
('ice_cream', 'Heladería', 'icecream', 'Venta de helados y postres fríos'),
('grocery', 'Abarrotes', 'shopping_cart', 'Tienda de abarrotes general'),
('pharmacy', 'Farmacia', 'medication', 'Venta de medicamentos'),
('clothing', 'Boutique/Ropa', 'checkroom', 'Venta de ropa y accesorios')
ON CONFLICT (name) DO NOTHING;

-- INSERTAR MÓDULOS
INSERT INTO modules (code, name, description, icon, category) VALUES
-- Ventas básicas
('quick_sale', 'Venta Rápida', 'Registro rápido de ventas', 'point_of_sale', 'sales'),
('sales_history', 'Historial de Ventas', 'Ver ventas pasadas', 'history', 'sales'),
('daily_cash', 'Corte de Caja', 'Cierre y apertura de caja', 'payments', 'sales'),

-- Inventario
('inventory', 'Inventario', 'Gestión de productos y stock', 'inventory', 'inventory'),
('stock_alerts', 'Alertas de Stock', 'Notificaciones de stock bajo', 'notifications', 'inventory'),
('suppliers', 'Proveedores', 'Gestión de proveedores', 'local_shipping', 'inventory'),

-- Operaciones - Restaurante
('tables', 'Mesas', 'Gestión de mesas', 'table_restaurant', 'operations'),
('waiters', 'Meseros', 'Gestión de meseros', 'person', 'operations'),
('orders', 'Órdenes', 'Control de comandas', 'receipt_long', 'operations'),
('kitchen_display', 'Pantalla Cocina', 'Monitor para cocina', 'kitchen', 'operations'),

-- Operaciones - Delivery
('delivery', 'Entregas a Domicilio', 'Gestión de entregas', 'delivery_dining', 'operations'),
('delivery_tracking', 'Seguimiento GPS', 'Rastreo de repartidores', 'my_location', 'operations'),

-- Clientes
('customers', 'Clientes', 'Base de datos de clientes', 'people', 'customers'),
('loyalty_program', 'Programa de Puntos', 'Sistema de lealtad', 'stars', 'customers'),
('reservations', 'Reservaciones', 'Sistema de reservas', 'event', 'customers'),

-- Reportes
('sales_reports', 'Reportes de Ventas', 'Análisis de ventas', 'analytics', 'reports'),
('inventory_reports', 'Reportes de Inventario', 'Análisis de inventario', 'assessment', 'reports'),
('employee_performance', 'Desempeño de Empleados', 'Métricas de personal', 'leaderboard', 'reports'),

-- Producción
('production', 'Producción Diaria', 'Control de producción', 'factory', 'operations'),
('recipes', 'Recetas', 'Gestión de recetas e ingredientes', 'menu_book', 'operations')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- CONFIGURAR MÓDULOS POR TIPO DE NEGOCIO
-- =====================================================

-- RESTAURANTE (Todos)
INSERT INTO business_type_modules (business_type_id, module_id, is_default, is_required, display_order)
SELECT 
    (SELECT id FROM business_types WHERE name = 'restaurant'),
    id,
    true,
    CASE WHEN code IN ('quick_sale', 'inventory', 'tables', 'orders') THEN true ELSE false END,
    ROW_NUMBER() OVER (ORDER BY id)
FROM modules
ON CONFLICT (business_type_id, module_id) DO NOTHING;

-- PANADERÍA
INSERT INTO business_type_modules (business_type_id, module_id, is_default, is_required, display_order)
SELECT 
    (SELECT id FROM business_types WHERE name = 'bakery'),
    id,
    true,
    CASE WHEN code IN ('quick_sale', 'inventory', 'production') THEN true ELSE false END,
    ROW_NUMBER() OVER (ORDER BY id)
FROM modules
WHERE code IN ('quick_sale', 'sales_history', 'daily_cash', 'inventory', 'stock_alerts', 
               'suppliers', 'customers', 'sales_reports', 'inventory_reports', 'production', 'recipes')
ON CONFLICT (business_type_id, module_id) DO NOTHING;

-- POLLERÍA
INSERT INTO business_type_modules (business_type_id, module_id, is_default, is_required, display_order)
SELECT 
    (SELECT id FROM business_types WHERE name = 'chicken_shop'),
    id,
    true,
    CASE WHEN code IN ('quick_sale', 'inventory') THEN true ELSE false END,
    ROW_NUMBER() OVER (ORDER BY id)
FROM modules
WHERE code IN ('quick_sale', 'sales_history', 'daily_cash', 'inventory', 'stock_alerts',
               'delivery', 'customers', 'sales_reports')
ON CONFLICT (business_type_id, module_id) DO NOTHING;

-- TAQUERÍA
INSERT INTO business_type_modules (business_type_id, module_id, is_default, is_required, display_order)
SELECT 
    (SELECT id FROM business_types WHERE name = 'taqueria'),
    id,
    CASE WHEN code IN ('tables', 'waiters', 'orders') THEN false ELSE true END,
    CASE WHEN code IN ('quick_sale', 'inventory') THEN true ELSE false END,
    ROW_NUMBER() OVER (ORDER BY id)
FROM modules
WHERE code IN ('quick_sale', 'sales_history', 'daily_cash', 'inventory', 'stock_alerts',
               'tables', 'orders', 'delivery', 'customers', 'sales_reports')
ON CONFLICT (business_type_id, module_id) DO NOTHING;

-- CARNICERÍA
INSERT INTO business_type_modules (business_type_id, module_id, is_default, is_required, display_order)
SELECT 
    (SELECT id FROM business_types WHERE name = 'butcher'),
    id,
    true,
    CASE WHEN code IN ('quick_sale', 'inventory') THEN true ELSE false END,
    ROW_NUMBER() OVER (ORDER BY id)
FROM modules
WHERE code IN ('quick_sale', 'sales_history', 'daily_cash', 'inventory', 'stock_alerts',
               'suppliers', 'customers', 'sales_reports', 'inventory_reports')
ON CONFLICT (business_type_id, module_id) DO NOTHING;

-- HELADERÍA
INSERT INTO business_type_modules (business_type_id, module_id, is_default, is_required, display_order)
SELECT 
    (SELECT id FROM business_types WHERE name = 'ice_cream'),
    id,
    true,
    CASE WHEN code IN ('quick_sale', 'inventory') THEN true ELSE false END,
    ROW_NUMBER() OVER (ORDER BY id)
FROM modules
WHERE code IN ('quick_sale', 'sales_history', 'daily_cash', 'inventory', 'stock_alerts',
               'delivery', 'customers', 'loyalty_program', 'sales_reports')
ON CONFLICT (business_type_id, module_id) DO NOTHING;

-- TAMALERA
INSERT INTO business_type_modules (business_type_id, module_id, is_default, is_required, display_order)
SELECT 
    (SELECT id FROM business_types WHERE name = 'tamale_shop'),
    id,
    true,
    CASE WHEN code IN ('quick_sale', 'inventory', 'production') THEN true ELSE false END,
    ROW_NUMBER() OVER (ORDER BY id)
FROM modules
WHERE code IN ('quick_sale', 'sales_history', 'daily_cash', 'inventory', 'stock_alerts',
               'production', 'recipes', 'customers', 'sales_reports')
ON CONFLICT (business_type_id, module_id) DO NOTHING;
