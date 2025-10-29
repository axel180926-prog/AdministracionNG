-- =====================================================
-- ESQUEMA DE BASE DE DATOS - Sistema Multi-Negocios
-- =====================================================

-- 1. TABLA DE TIPOS DE NEGOCIO
CREATE TABLE business_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. NEGOCIOS
CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    address TEXT,
    business_type_id INTEGER REFERENCES business_types(id),
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. USUARIOS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. MÓDULOS DEL SISTEMA
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. CONFIGURACIÓN DE MÓDULOS POR TIPO DE NEGOCIO
CREATE TABLE business_type_modules (
    id SERIAL PRIMARY KEY,
    business_type_id INTEGER REFERENCES business_types(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT true,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    UNIQUE(business_type_id, module_id)
);

-- 6. MÓDULOS ACTIVOS POR NEGOCIO
CREATE TABLE business_modules (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    custom_settings JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, module_id)
);

-- 7. CONFIGURACIÓN DEL NEGOCIO
CREATE TABLE business_settings (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE UNIQUE,
    business_type_id INTEGER REFERENCES business_types(id),
    
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    secondary_color VARCHAR(7) DEFAULT '#10B981',
    logo_url TEXT,
    
    currency VARCHAR(3) DEFAULT 'MXN',
    timezone VARCHAR(50) DEFAULT 'America/Mexico_City',
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    enable_tax BOOLEAN DEFAULT false,
    
    table_count INTEGER,
    enable_table_reservation BOOLEAN DEFAULT false,
    enable_delivery BOOLEAN DEFAULT false,
    delivery_radius_km DECIMAL(5, 2),
    enable_loyalty_points BOOLEAN DEFAULT false,
    points_per_peso DECIMAL(5, 2),
    
    business_hours JSONB,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. CATEGORÍAS DE PRODUCTOS
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 9. PRODUCTOS
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    sku VARCHAR(100) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost_price DECIMAL(10, 2) DEFAULT 0,
    sale_price DECIMAL(10, 2) NOT NULL,
    min_stock INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 10. INVENTARIO
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE UNIQUE,
    current_stock INTEGER DEFAULT 0,
    last_restock_date TIMESTAMP,
    last_updated TIMESTAMP DEFAULT NOW()
);

-- 11. HISTORIAL DE INVENTARIO
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    movement_type VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_id INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 12. VENTAS
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    sale_number VARCHAR(50) UNIQUE NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    status VARCHAR(50) DEFAULT 'completed',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 13. ITEMS DE VENTA
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 14. MESAS (RESTAURANTES)
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    table_number VARCHAR(20) NOT NULL,
    capacity INTEGER DEFAULT 4,
    status VARCHAR(20) DEFAULT 'available',
    current_order_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, table_number)
);

-- 15. MESEROS
CREATE TABLE waiters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    employee_code VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 16. ÓRDENES
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    table_id INTEGER REFERENCES tables(id),
    waiter_id INTEGER REFERENCES waiters(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    subtotal DECIMAL(10, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    customer_count INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 17. ITEMS DE ORDEN
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 18. ENTREGAS
CREATE TABLE deliveries (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    business_id INTEGER REFERENCES businesses(id) ON DELETE CASCADE,
    delivery_person_id INTEGER REFERENCES users(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_coordinates POINT,
    status VARCHAR(50) DEFAULT 'pending',
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    estimated_time INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX idx_sales_business ON sales(business_id);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_users_business ON users(business_id);
CREATE INDEX idx_tables_business ON tables(business_id);
CREATE INDEX idx_orders_business ON orders(business_id);
CREATE INDEX idx_deliveries_business ON deliveries(business_id);
