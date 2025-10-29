const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const router = express.Router();

const generateTokens = (userId, username, role) => {
  const accessToken = jwt.sign(
    { userId, username, role },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { userId, username },
    process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Registro
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'employee' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email y password requeridos' });
    }

    const existingUser = await db.query('SELECT id FROM users WHERE username = $1 OR email = $2', [username, email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Usuario o email ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, role',
      [username, email, passwordHash, fullName, role]
    );

    const user = result.rows[0];
    const tokens = generateTokens(user.id, user.username, user.role);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user,
      ...tokens
    });
  } catch (error) {
    console.error('❌ Error en register:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username y password requeridos' });
    }

    const result = await db.query('SELECT id, username, email, password_hash, role FROM users WHERE username = $1 OR email = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const tokens = generateTokens(user.id, user.username, user.role);

    res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      ...tokens
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Refresh token
router.post('/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your_refresh_secret', (err, user) => {
      if (err) {
        return res.status(401).json({ error: 'Refresh token inválido' });
      }

      const newAccessToken = jwt.sign(
        { userId: user.userId, username: user.username },
        process.env.JWT_SECRET || 'your_secret_key',
        { expiresIn: '1h' }
      );

      res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error('❌ Error en refresh:', error);
    res.status(500).json({ error: 'Error al refrescar token' });
  }
});

module.exports = router;
