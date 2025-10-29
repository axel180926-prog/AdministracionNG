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

// Registro
router.post('/register', registerValidation, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, businessName } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear negocio
    const business = await pool.query('INSERT INTO businesses (name) VALUES ($1) RETURNING id', [
      businessName,
    ]);

    // Crear usuario
    const user = await pool.query(
      'INSERT INTO users (email, password, business_id, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
      [email, hashedPassword, business.rows[0].id, 'admin']
    );

    const token = jwt.sign(
      { id: user.rows[0].id, email: user.rows[0].email, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

export default router;
