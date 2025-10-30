import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../../config/database';

interface UserPayload {
  id: number;
  email: string;
  role: string;
  businessId: number;
}

export class AuthService {
  static generateToken(user: UserPayload): string {
    return jwt.sign(user, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '24h',
    });
  }

  static verifyToken(token: string): UserPayload | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return decoded as UserPayload;
    } catch (error) {
      return null;
    }
  }

  static async login(email: string, password: string) {
    // Buscar usuario
    const result = await pool.query(
      'SELECT u.*, b.name as business_name FROM users u JOIN businesses b ON u.business_id = b.id WHERE u.email = $1 AND u.is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new Error('Contraseña incorrecta');
    }

    // Generar token
    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      businessId: user.business_id,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        businessId: user.business_id,
        businessName: user.business_name,
      },
    };
  }

  static async register(email: string, password: string, businessName: string) {
    // Verificar si el usuario existe
    const existsResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existsResult.rows.length > 0) {
      throw new Error('El email ya está registrado');
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Crear negocio
      const businessResult = await client.query(
        'INSERT INTO businesses (name, owner_name, is_active) VALUES ($1, $2, true) RETURNING id, name',
        [businessName, email]
      );

      const businessId = businessResult.rows[0].id;

      // Crear usuario admin
      const userResult = await client.query(
        `INSERT INTO users (business_id, email, password_hash, full_name, role, is_active) 
         VALUES ($1, $2, $3, $4, $5, true) 
         RETURNING id, email, role`,
        [businessId, email, hashedPassword, email, 'admin']
      );

      await client.query('COMMIT');

      // Generar token
      const token = this.generateToken({
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        role: userResult.rows[0].role,
        businessId,
      });

      return {
        token,
        business: {
          id: businessId,
          name: businessResult.rows[0].name,
        },
        user: {
          id: userResult.rows[0].id,
          email: userResult.rows[0].email,
          role: userResult.rows[0].role,
        },
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async verifyEmail(email: string): Promise<boolean> {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    return result.rows.length > 0;
  }

  static async getUserById(userId: number) {
    const result = await pool.query(
      'SELECT u.id, u.email, u.full_name, u.role, u.business_id FROM users u WHERE u.id = $1 AND u.is_active = true',
      [userId]
    );

    return result.rows[0] || null;
  }

  static async changePassword(userId: number, oldPassword: string, newPassword: string) {
    // Obtener usuario
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña antigua
    const validPassword = await bcrypt.compare(oldPassword, result.rows[0].password_hash);
    if (!validPassword) {
      throw new Error('Contraseña actual incorrecta');
    }

    // Hash nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar
    await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
      hashedPassword,
      userId,
    ]);

    return true;
  }

  static async logout(userId: number) {
    // En este caso simple, el logout se maneja en el cliente eliminando el token
    // Pero podríamos implementar un blacklist si es necesario
    return true;
  }
}
