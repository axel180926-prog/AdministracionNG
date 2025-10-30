import { Request, Response } from 'express';
import { ReportsService } from '../services/ReportsService';

export class ReportsController {
  static async getSalesReport(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;
      const { dateFrom, dateTo } = req.query;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      if (!dateFrom || !dateTo) {
        return res.status(400).json({ success: false, message: 'Fechas requeridas' });
      }

      const report = await ReportsService.getSalesReport(businessId, dateFrom as string, dateTo as string);
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Error al obtener reporte de ventas:', error);
      res.status(500).json({ success: false, message: 'Error al obtener reporte' });
    }
  }

  static async getSalesByCategory(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;
      const { dateFrom, dateTo } = req.query;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      if (!dateFrom || !dateTo) {
        return res.status(400).json({ success: false, message: 'Fechas requeridas' });
      }

      const report = await ReportsService.getSalesByCategory(businessId, dateFrom as string, dateTo as string);
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Error al obtener reporte por categoría:', error);
      res.status(500).json({ success: false, message: 'Error al obtener reporte' });
    }
  }

  static async getTopProducts(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;
      const { dateFrom, dateTo, limit = 10 } = req.query;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      if (!dateFrom || !dateTo) {
        return res.status(400).json({ success: false, message: 'Fechas requeridas' });
      }

      const report = await ReportsService.getTopProducts(
        businessId,
        dateFrom as string,
        dateTo as string,
        parseInt(limit as string)
      );
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Error al obtener top productos:', error);
      res.status(500).json({ success: false, message: 'Error al obtener reporte' });
    }
  }

  static async getInventoryReport(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const report = await ReportsService.getInventoryReport(businessId);
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Error al obtener reporte de inventario:', error);
      res.status(500).json({ success: false, message: 'Error al obtener reporte' });
    }
  }

  static async getLowStockReport(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const report = await ReportsService.getLowStockReport(businessId);
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Error al obtener reporte de bajo stock:', error);
      res.status(500).json({ success: false, message: 'Error al obtener reporte' });
    }
  }

  static async getInventoryMovements(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;
      const { dateFrom, dateTo, limit = 100 } = req.query;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      if (!dateFrom || !dateTo) {
        return res.status(400).json({ success: false, message: 'Fechas requeridas' });
      }

      const movements = await ReportsService.getInventoryMovements(
        businessId,
        dateFrom as string,
        dateTo as string,
        parseInt(limit as string)
      );
      res.json({ success: true, data: movements });
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      res.status(500).json({ success: false, message: 'Error al obtener reporte' });
    }
  }

  static async getDashboardSummary(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const summary = await ReportsService.getDashboardSummary(businessId);
      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Error al obtener resumen del dashboard:', error);
      res.status(500).json({ success: false, message: 'Error al obtener reporte' });
    }
  }

  static async getDailyReport(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;
      const { date } = req.query;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      if (!date) {
        return res.status(400).json({ success: false, message: 'Fecha requerida' });
      }

      const report = await ReportsService.getDailyReport(businessId, date as string);
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Error al obtener reporte diario:', error);
      res.status(500).json({ success: false, message: 'Error al obtener reporte' });
    }
  }

  static async getSalesByPaymentMethod(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;
      const { dateFrom, dateTo } = req.query;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      if (!dateFrom || !dateTo) {
        return res.status(400).json({ success: false, message: 'Fechas requeridas' });
      }

      const report = await ReportsService.getSalesByPaymentMethod(
        businessId,
        dateFrom as string,
        dateTo as string
      );
      res.json({ success: true, data: report });
    } catch (error) {
      console.error('Error al obtener ventas por método de pago:', error);
      res.status(500).json({ success: false, message: 'Error al obtener reporte' });
    }
  }
}
