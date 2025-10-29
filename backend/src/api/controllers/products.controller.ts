import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import pool from '../../config/database';
import { Product } from '../../types';
import { ApiResponse, PaginatedResponse } from '../../types/api.types';

interface AuthRequest extends Request {
  user?: {
    id: number;
    businessId: number;
    role: string;
  };
}

export class ProductsController {
  public static async getProducts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const offset = (page - 1) * pageSize;

      const searchTerm = req.query.search as string;
      const category = req.query.category as string;

      let query = 'SELECT * FROM products WHERE business_id = $1';
      const queryParams: any[] = [req.user?.businessId];

      if (searchTerm) {
        query += ' AND (name ILIKE $2 OR description ILIKE $2)';
        queryParams.push(`%${searchTerm}%`);
      }

      if (category) {
        query += ` AND category = $${queryParams.length + 1}`;
        queryParams.push(category);
      }

      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
      const totalResult = await pool.query(countQuery, queryParams);
      const total = parseInt(totalResult.rows[0].count);

      query += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${
        queryParams.length + 2
      }`;
      queryParams.push(pageSize, offset);

      const result = await pool.query(query, queryParams);

      const response: PaginatedResponse<Product> = {
        success: true,
        data: {
          items: result.rows,
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      };

      res.json(response);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los productos',
      } as ApiResponse);
    }
  }

  public static async createProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        } as ApiResponse);
        return;
      }

      const { name, description, price, stock, category } = req.body;

      const result = await pool.query(
        'INSERT INTO products (name, description, price, stock, category, business_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, description, price, stock, category, req.user?.businessId]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
      } as ApiResponse<Product>);
    } catch (error) {
      console.error('Error al crear producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el producto',
      } as ApiResponse);
    }
  }

  public static async updateProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          errors: errors.array(),
        } as ApiResponse);
        return;
      }

      const { id } = req.params;
      const { name, description, price, stock, category } = req.body;

      // Verificar que el producto pertenezca al negocio
      const productExists = await pool.query(
        'SELECT * FROM products WHERE id = $1 AND business_id = $2',
        [id, req.user?.businessId]
      );

      if (productExists.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado',
        } as ApiResponse);
        return;
      }

      const result = await pool.query(
        'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category = $5, updated_at = NOW() WHERE id = $6 AND business_id = $7 RETURNING *',
        [name, description, price, stock, category, id, req.user?.businessId]
      );

      res.json({
        success: true,
        data: result.rows[0],
      } as ApiResponse<Product>);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el producto',
      } as ApiResponse);
    }
  }

  public static async deleteProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Verificar que el producto pertenezca al negocio
      const productExists = await pool.query(
        'SELECT * FROM products WHERE id = $1 AND business_id = $2',
        [id, req.user?.businessId]
      );

      if (productExists.rows.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Producto no encontrado',
        } as ApiResponse);
        return;
      }

      await pool.query('DELETE FROM products WHERE id = $1 AND business_id = $2', [
        id,
        req.user?.businessId,
      ]);

      res.json({
        success: true,
        message: 'Producto eliminado correctamente',
      } as ApiResponse);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar el producto',
      } as ApiResponse);
    }
  }
}
