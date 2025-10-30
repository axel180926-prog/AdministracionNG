import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// Validaciones
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es requerida'),
];

const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('businessName').notEmpty().withMessage('El nombre del negocio es requerido'),
];

// Rutas
router.post('/login', loginValidation, AuthController.login);
router.post('/register', registerValidation, AuthController.register);

export default router;
