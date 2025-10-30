const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT
 * Valida el token y extrae la información del usuario
 * Permite acceso a: req.user.userId, req.user.businessId, req.user.email, req.user.role
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Token requerido',
      message: 'Proporciona un token en el header: Authorization: Bearer <token>' 
    });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || 'dev_secret_key_change_in_production',
    (err, user) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Token expirado',
            message: 'Usa el refresh-token para obtener un nuevo token' 
          });
        }
        return res.status(403).json({ 
          error: 'Token inválido',
          message: err.message 
        });
      }

      // Adjuntar usuario al request
      req.user = user;
      next();
    }
  );
};

/**
 * Middleware para verificar permisos basados en roles
 * Uso: checkPermission(['owner', 'admin'])
 */
const checkPermission = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permisos insuficientes',
        message: `Se requieren uno de los roles: ${allowedRoles.join(', ')}`,
        yourRole: req.user.role
      });
    }

    next();
  };
};

/**
 * Middleware para verificar que el negocio coincide
 * Usa: checkBusinessId()
 */
const checkBusinessId = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const bodyBusinessId = req.body.businessId || req.query.businessId;
    
    if (bodyBusinessId && bodyBusinessId !== req.user.businessId) {
      return res.status(403).json({ 
        error: 'No tienes acceso a este negocio' 
      });
    }

    next();
  };
};

module.exports = { 
  authenticateToken, 
  checkPermission,
  checkBusinessId
};
