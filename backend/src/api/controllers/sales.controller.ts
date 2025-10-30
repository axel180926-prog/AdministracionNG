import { Request, Response } from 'express';
import { SalesService } from '../services/SalesService';

export class SalesController {
  static async getSales(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, dateFrom, dateTo } = req.query;
      const businessId = (req as any)?.user?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const result = await SalesService.getSalesByBusiness(
        businessId,
        Number(page),
        Number(limit),
        dateFrom as string,
        dateTo as string
      );

      res.json({ success: true, ...result });
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      res.status(500).json({ success: false, message: 'Error al obtener ventas' });
    }
  }

  static async getSaleById(req: Request, res: Response) {
    try {
      const businessId = ((req as any).user)?.businessId;
      const { id } = req.params;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const sale = await SalesService.getSaleById(businessId, Number(id));

      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' });
      }

      res.json({ success: true, data: sale });
    } catch (error) {
      console.error('Error al obtener venta:', error);
      res.status(500).json({ success: false, message: 'Error al obtener venta' });
    }
  }

  static async createSale(req: Request, res: Response) {
    try {
      const businessId = ((req as any).user)?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      // Validar datos
      const { customer_name, items, payment_method } = req.body;
      
      if (!customer_name || !items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Datos incompletos' });
      }

      const sale = await SalesService.createSale(businessId, req.body);
      res.status(201).json({ success: true, data: sale });
    } catch (error: any) {
      console.error('Error al crear venta:', error);
      res.status(500).json({ success: false, message: error.message || 'Error al crear venta' });
    }
  }

  static async updateSaleStatus(req: Request, res: Response) {
    try {
      const businessId = ((req as any).user)?.businessId;
      const { id } = req.params;
      const { status } = req.body;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status requerido' });
      }

      const sale = await SalesService.updateSaleStatus(businessId, Number(id), status);

      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada' });
      }

      res.json({ success: true, data: sale });
    } catch (error) {
      console.error('Error al actualizar venta:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar venta' });
    }
  }

  static async getSalesReport(req: Request, res: Response) {
    try {
      const businessId = ((req as any).user)?.businessId;
      const { dateFrom, dateTo } = req.query;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      if (!dateFrom || !dateTo) {
        return res.status(400).json({ success: false, message: 'Fechas requeridas' });
      }

      const report = await SalesService.getSalesReport(businessId, dateFrom as string, dateTo as string);
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Error al obtener reporte:', error);
      res.status(500).json({ success: false, message: 'Error al obtener reporte' });
    }
  }
}
