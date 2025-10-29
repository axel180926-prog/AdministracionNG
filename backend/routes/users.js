const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET todos los usuarios
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, email, full_name, role, active, created_at FROM users WHERE active = true ORDER BY username'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// GET usuario por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT id, username, email, full_name, role, active, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// POST crear usuario (requiere autenticación)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { username, email, password, fullName, role = 'employee' } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email y password son requeridos' });
    }

    const existingUser = await db.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Usuario o email ya existe' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, full_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name, role, created_at',
      [username, email, passwordHash, fullName, role]
    );

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// PUT editar usuario (requiere autenticación)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, fullName, role, active, password } = req.body;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (email !== undefined) { updates.push(`email = $${paramIndex++}`); params.push(email); }
    if (fullName !== undefined) { updates.push(`full_name = $${paramIndex++}`); params.push(fullName); }
    if (role !== undefined) { updates.push(`role = $${paramIndex++}`); params.push(role); }
    if (active !== undefined) { updates.push(`active = $${paramIndex++}`); params.push(active); }
    if (password !== undefined) {
      const passwordHash = await bcrypt.hash(password, 10);
      updates.push(`password_hash = $${paramIndex++}`);
      params.push(passwordHash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    updates.push(`updated_at = $${paramIndex++}`);
    params.push(new Date());
    params.push(id);

    const result = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, username, email, full_name, role, active, updated_at`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// DELETE usuario (requiere autenticación)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete - marcar como inactivo
    const result = await db.query(
      'UPDATE users SET active = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

module.exports = router;
