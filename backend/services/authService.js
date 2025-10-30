const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Hash de contraseña usando bcrypt
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Comparar contraseña con hash
 */
const comparePasswords = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generar JWT tokens (access + refresh)
 */
const generateTokens = (userId, businessId, email, role) => {
  const accessToken = jwt.sign(
    { 
      userId, 
      businessId,
      email,
      role 
    },
    process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
    { expiresIn: '7d' }  // Token válido por 7 días
  );

  const refreshToken = jwt.sign(
    { 
      userId, 
      businessId,
      email 
    },
    process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_production',
    { expiresIn: '30d' }  // Refresh válido por 30 días
  );

  return { accessToken, refreshToken };
};

/**
 * Validar token JWT
 */
const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_key_change_in_production');
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

/**
 * Refrescar token usando refresh token
 */
const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_in_production');
    const newAccessToken = jwt.sign(
      { 
        userId: decoded.userId, 
        businessId: decoded.businessId,
        email: decoded.email,
        role: decoded.role
      },
      process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
      { expiresIn: '7d' }
    );
    return { success: true, accessToken: newAccessToken };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Registrar nuevo usuario
 * IMPORTANTE: Asume que businessId viene del usuario logueado o es el owner creando su negocio
 */
const registerUser = async (email, password, firstName, lastName, businessId = null) => {
  try {
    // Validar email único
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return { 
        success: false, 
        error: 'El email ya está registrado' 
      };
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insertar usuario
    const result = await db.query(
      `INSERT INTO users 
       (email, password_hash, first_name, last_name, business_id, role, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING id, email, first_name, last_name, business_id, role, created_at`,
      [email, passwordHash, firstName, lastName, businessId || 1, 'owner']  // Default business_id = 1
    );

    const user = result.rows[0];
    const tokens = generateTokens(user.id, user.business_id, user.email, user.role);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        businessId: user.business_id,
        role: user.role
      },
      ...tokens
    };
  } catch (error) {
    console.error('❌ Error en registerUser:', error);
    return { 
      success: false, 
      error: 'Error al registrar usuario: ' + error.message 
    };
  }
};

/**
 * Login de usuario
 */
const loginUser = async (email, password) => {
  try {
    // Buscar usuario por email
    const result = await db.query(
      `SELECT id, email, password_hash, first_name, last_name, business_id, role 
       FROM users 
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return { 
        success: false, 
        error: 'Email o contraseña incorrectos' 
      };
    }

    const user = result.rows[0];

    // Validar contraseña
    const passwordMatch = await comparePasswords(password, user.password_hash);

    if (!passwordMatch) {
      return { 
        success: false, 
        error: 'Email o contraseña incorrectos' 
      };
    }

    // Generar tokens
    const tokens = generateTokens(user.id, user.business_id, user.email, user.role);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        businessId: user.business_id,
        role: user.role
      },
      ...tokens
    };
  } catch (error) {
    console.error('❌ Error en loginUser:', error);
    return { 
      success: false, 
      error: 'Error al iniciar sesión: ' + error.message 
    };
  }
};

/**
 * Obtener usuario por ID
 */
const getUserById = async (userId) => {
  try {
    const result = await db.query(
      `SELECT id, email, first_name, last_name, business_id, role, created_at 
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return { 
        success: false, 
        error: 'Usuario no encontrado' 
      };
    }

    const user = result.rows[0];
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        businessId: user.business_id,
        role: user.role,
        createdAt: user.created_at
      }
    };
  } catch (error) {
    console.error('❌ Error en getUserById:', error);
    return { 
      success: false, 
      error: 'Error al obtener usuario: ' + error.message 
    };
  }
};

module.exports = {
  hashPassword,
  comparePasswords,
  generateTokens,
  validateToken,
  refreshAccessToken,
  registerUser,
  loginUser,
  getUserById
};
