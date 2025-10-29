import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';
import { ApiResponse, LoginResponse, RegisterResponse } from '../../types/api.types';

export class AuthController {
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        } as ApiResponse);
        return;
      }

      const { email, password } = req.body;
      const result = await pool.query(
        'SELECT u.*, b.name as business_name FROM users u JOIN businesses b ON u.business_id = b.id WHERE u.email = $1',
        [email]
      );
      const user = result.rows[0];

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        } as ApiResponse);
        return;
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        res.status(401).json({
          success: false,
          message: 'Contraseña incorrecta',
        } as ApiResponse);
        return;
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          businessId: user.business_id,
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      const response: LoginResponse = {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          businessId: user.business_id,
        },
      };

      res.json({
        success: true,
        data: response,
      } as ApiResponse<LoginResponse>);
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor',
      } as ApiResponse);
    }
  }

  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        } as ApiResponse);
        return;
      }

      const { email, password, businessName } = req.body;

      // Verificar si el usuario ya existe
      const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        res.status(400).json({
          success: false,
          message: 'El email ya está registrado',
        } as ApiResponse);
        return;
      }

      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear negocio
        const business = await client.query(
          'INSERT INTO businesses (name) VALUES ($1) RETURNING id, name',
          [businessName]
        );

        // Crear usuario
        const user = await client.query(
          'INSERT INTO users (email, password, business_id, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
          [email, hashedPassword, business.rows[0].id, 'admin']
        );

        await client.query('COMMIT');

        const token = jwt.sign(
          {
            id: user.rows[0].id,
            email: user.rows[0].email,
            role: 'admin',
            businessId: business.rows[0].id,
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        const response: RegisterResponse = {
          token,
          business: {
            id: business.rows[0].id,
            name: business.rows[0].name,
          },
          user: {
            id: user.rows[0].id,
            email: user.rows[0].email,
            role: user.rows[0].role,
          },
        };

        res.status(201).json({
          success: true,
          data: response,
        } as ApiResponse<RegisterResponse>);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error del servidor',
      } as ApiResponse);
    }
  }
}
