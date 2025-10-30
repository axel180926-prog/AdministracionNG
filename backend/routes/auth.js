const express = require('express');
const { body, validationResult } = require('express-validator');
const authService = require('../services/authService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 * Body: { email, password, firstName, lastName }
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Contraseña debe tener mínimo 8 caracteres'),
    body('firstName').notEmpty().withMessage('Primer nombre requerido'),
    body('lastName').notEmpty().withMessage('Apellido requerido')
  ],
  async (req, res) => {
    try {
      // Validar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validación fallida',
          details: errors.array() 
        });
      }

      const { email, password, firstName, lastName } = req.body;

      const result = await authService.registerUser(email, password, firstName, lastName);

      if (!result.success) {
        return res.status(409).json({ error: result.error });
      }

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
    } catch (error) {
      console.error('❌ Error en register:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }
);

/**
 * POST /api/auth/login
 * Iniciar sesión
 * Body: { email, password }
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña requerida')
  ],
  async (req, res) => {
    try {
      // Validar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validación fallida',
          details: errors.array() 
        });
      }

      const { email, password } = req.body;

      const result = await authService.loginUser(email, password);

      if (!result.success) {
        return res.status(401).json({ error: result.error });
      }

      res.json({
        message: 'Login exitoso',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
    } catch (error) {
      console.error('❌ Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }
);

/**
 * POST /api/auth/refresh-token
 * Renovar token de acceso usando refresh token
 * Body: { refreshToken }
 */
router.post('/refresh-token', (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido' });
    }

    const result = authService.refreshAccessToken(refreshToken);

    if (!result.success) {
      return res.status(401).json({ error: 'Refresh token inválido o expirado' });
    }

    res.json({
      message: 'Token renovado exitosamente',
      accessToken: result.accessToken
    });
  } catch (error) {
    console.error('❌ Error en refresh-token:', error);
    res.status(500).json({ error: 'Error al refrescar token' });
  }
});

/**
 * GET /api/auth/me
 * Obtener información del usuario logueado
 * Requiere: Authorization header con token
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const result = await authService.getUserById(userId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      user: result.user
    });
  } catch (error) {
    console.error('❌ Error en /me:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

/**
 * POST /api/auth/logout
 * Logout (en cliente eliminar tokens del localStorage)
 */
router.post('/logout', authenticateToken, (req, res) => {
  // En este caso es un logout "dummy" porque JWT es stateless
  // En producción, podrías invalidar el token en una blacklist
  res.json({
    message: 'Logout exitoso. Elimina los tokens del cliente.'
  });
});

module.exports = router;
