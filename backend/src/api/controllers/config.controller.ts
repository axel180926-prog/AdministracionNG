import { Request, Response } from 'express';
import { ConfigService } from '../services/ConfigService';

export class ConfigController {
  // Obtener configuración completa
  static async getConfig(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const [config, modules, businessInfo] = await Promise.all([
        ConfigService.getBusinessConfig(businessId),
        ConfigService.getActiveModules(businessId),
        ConfigService.getBusinessInfo(businessId),
      ]);

      res.json({
        success: true,
        data: {
          config,
          modules,
          businessInfo,
        },
      });
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      res.status(500).json({ success: false, message: 'Error al obtener configuración' });
    }
  }

  // Obtener módulos activos
  static async getModules(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const modules = await ConfigService.getActiveModules(businessId);
      res.json({ success: true, data: modules });
    } catch (error) {
      console.error('Error al obtener módulos:', error);
      res.status(500).json({ success: false, message: 'Error al obtener módulos' });
    }
  }

  // Obtener todos los módulos disponibles
  static async getAvailableModules(req: Request, res: Response) {
    try {
      const modules = await ConfigService.getAvailableModules();
      res.json({ success: true, data: modules });
    } catch (error) {
      console.error('Error al obtener módulos disponibles:', error);
      res.status(500).json({ success: false, message: 'Error al obtener módulos' });
    }
  }

  // Activar/desactivar módulo
  static async toggleModule(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;
      const { moduleId, isActive } = req.body;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      if (!moduleId) {
        return res.status(400).json({ success: false, message: 'moduleId requerido' });
      }

      const module = await ConfigService.toggleModule(businessId, moduleId, isActive);
      res.json({ success: true, data: module });
    } catch (error) {
      console.error('Error al activar/desactivar módulo:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar módulo' });
    }
  }

  // Actualizar configuración del negocio
  static async updateConfig(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const config = await ConfigService.updateBusinessConfig(businessId, req.body);
      res.json({ success: true, data: config });
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar configuración' });
    }
  }

  // Obtener información del negocio
  static async getBusinessInfo(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const info = await ConfigService.getBusinessInfo(businessId);
      res.json({ success: true, data: info });
    } catch (error) {
      console.error('Error al obtener información del negocio:', error);
      res.status(500).json({ success: false, message: 'Error al obtener información' });
    }
  }

  // Actualizar información del negocio
  static async updateBusinessInfo(req: Request, res: Response) {
    try {
      const businessId = (req as any).user?.businessId;

      if (!businessId) {
        return res.status(401).json({ success: false, message: 'No autorizado' });
      }

      const info = await ConfigService.updateBusinessInfo(businessId, req.body);
      res.json({ success: true, data: info });
    } catch (error) {
      console.error('Error al actualizar información del negocio:', error);
      res.status(500).json({ success: false, message: 'Error al actualizar información' });
    }
  }

  // Obtener categorías de módulos
  static async getModuleCategories(req: Request, res: Response) {
    try {
      const categories = await ConfigService.getModuleCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      res.status(500).json({ success: false, message: 'Error al obtener categorías' });
    }
  }

  // Obtener módulos por categoría
  static async getModulesByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;

      if (!category) {
        return res.status(400).json({ success: false, message: 'Categoría requerida' });
      }

      const modules = await ConfigService.getModulesByCategory(category);
      res.json({ success: true, data: modules });
    } catch (error) {
      console.error('Error al obtener módulos por categoría:', error);
      res.status(500).json({ success: false, message: 'Error al obtener módulos' });
    }
  }
}
