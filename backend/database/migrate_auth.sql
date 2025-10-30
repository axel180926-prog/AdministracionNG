-- =====================================================
-- MIGRACIÓN PARA AUTH API
-- Actualiza la tabla users para soportar email y nombres separados
-- =====================================================

-- 1. Agregar columnas faltantes a users si no existen
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS first_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. Crear índice en email para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. Asegurar que business_id sea NOT NULL (si hay usuarios sin negocio, asignar a 1)
UPDATE users SET business_id = 1 WHERE business_id IS NULL;

ALTER TABLE users
ALTER COLUMN business_id SET NOT NULL;

-- 4. Insertar un negocio de prueba si no existe
INSERT INTO businesses (name, owner_name, phone, email, address, business_type_id, subscription_plan, is_active)
SELECT 'Negocio Demo', 'Admin Demo', '+505 1234567', 'admin@demo.local', 'Calle Principal 123', 1, 'basic', true
WHERE NOT EXISTS (SELECT 1 FROM businesses WHERE id = 1);

-- 5. Insertar tipos de negocio básicos si no existen
INSERT INTO business_types (name, display_name, icon, description)
VALUES
  ('restaurant', 'Restaurante', '🍽️', 'Restaurante con mesas y servicio de comidas'),
  ('polleria', 'Pollería', '🍗', 'Negocio especializado en pollos'),
  ('bakery', 'Panadería', '🥖', 'Negocio de panificación'),
  ('taqueria', 'Taquería', '🌮', 'Negocio de tacos y comida mexicana'),
  ('cafe', 'Cafetería', '☕', 'Café y bebidas')
ON CONFLICT (name) DO NOTHING;

-- 6. Insertar módulos básicos si no existen
INSERT INTO modules (code, name, description, icon, category)
VALUES
  ('quick_sale', 'Venta Rápida', 'Registro rápido de ventas', '⚡', 'sales'),
  ('inventory', 'Inventario', 'Gestión de stock', '📦', 'inventory'),
  ('products', 'Productos', 'Gestión de catálogo', '🏷️', 'inventory'),
  ('tables', 'Mesas', 'Control de mesas (restaurante)', '🪑', 'restaurant'),
  ('orders', 'Órdenes', 'Sistema de órdenes/comanda', '📋', 'restaurant'),
  ('delivery', 'Entregas', 'Gestión de entregas a domicilio', '🚗', 'delivery'),
  ('reports', 'Reportes', 'Reportes y analytics', '📊', 'reports'),
  ('waiters', 'Meseros', 'Gestión de personal', '👥', 'staff'),
  ('production', 'Producción', 'Control de producción (panaderías)', '⚙️', 'production')
ON CONFLICT (code) DO NOTHING;

-- 7. Verificación final
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_businesses FROM businesses;
SELECT COUNT(*) as total_modules FROM modules;
