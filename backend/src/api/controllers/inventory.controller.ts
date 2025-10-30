import { Request, Response } from 'express';
import { InventoryService } from '../services/InventoryService';

export class InventoryController {
  static async getInventory(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, lowStockOnly = false } = req.query;
      const businessId = ((req as any).user)?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const result = await InventoryService.getInventoryByBusiness(
        businessId,
        Number(page),
        Number(limit),
        lowStockOnly === 'true'
      );

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error al obtener inventario:', error);
      res.status(500).json({ success: false, message: 'Error al obtener inventario' });
    }
  }

  static async addStock(req: Request, res: Response) {
    try {
      const businessId = ((req as any).user)?.businessId;
      const { productId, quantity, notes } = req.body;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      if (!productId || !quantity) {
        return res.status(400).json({ success: false, message: 'Datos incompletos' });
      }

      const product = await InventoryService.addStock(businessId, productId, quantity, notes);
      res.json({ success: true, data: product });
    } catch (error: any) {
      console.error('Error al agregar stock:', error);
      res.status(500).json({ success: false, message: error.message || 'Error al agregar stock' });
    }
  }

  static async removeStock(req: Request, res: Response) {
    try {
      const businessId = ((req as any).user)?.businessId;
      const { productId, quantity, reason } = req.body;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      if (!productId || !quantity) {
        return res.status(400).json({ success: false, message: 'Datos incompletos' });
      }

      const product = await InventoryService.removeStock(businessId, productId, quantity, reason);
      res.json({ success: true, data: product });
    } catch (error: any) {
      console.error('Error al restar stock:', error);
      res.status(500).json({ success: false, message: error.message || 'Error al restar stock' });
    }
  }

  static async getMovementHistory(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, productId } = req.query;
      const businessId = ((req as any).user)?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const result = await InventoryService.getMovementHistory(
        businessId,
        productId ? Number(productId) : undefined,
        Number(page),
        Number(limit)
      );

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({ success: false, message: 'Error al obtener historial' });
    }
  }

  static async getLowStockProducts(req: Request, res: Response) {
    try {
      const businessId = ((req as any).user)?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const products = await InventoryService.getLowStockProducts(businessId);
      res.json({ success: true, data: products });
    } catch (error) {
      console.error('Error al obtener productos con bajo stock:', error);
      res.status(500).json({ success: false, message: 'Error al obtener productos con bajo stock' });
    }
  }

  static async getInventorySummary(req: Request, res: Response) {
    try {
      const businessId = ((req as any).user)?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const summary = await InventoryService.getInventorySummary(businessId);
      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Error al obtener resumen de inventario:', error);
      res.status(500).json({ success: false, message: 'Error al obtener resumen de inventario' });
    }
  }
}
