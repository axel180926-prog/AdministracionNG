import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Token no proporcionado' });
    return;
  }

  const decoded = AuthService.verifyToken(token);

  if (!decoded) {
    res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    return;
  }

  (req as any).user = decoded;
  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  
  if (!user) {
    res.status(401).json({ success: false, message: 'No autenticado' });
    return;
  }

  if (user.role !== 'admin') {
    res.status(403).json({ success: false, message: 'Acceso denegado: se requiere rol de administrador' });
    return;
  }

  next();
};

export const isOwner = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;

  if (!user) {
    res.status(401).json({ success: false, message: 'No autenticado' });
    return;
  }

  const businessId = req.body.businessId || req.query.businessId || req.params.businessId;

  if (businessId && user.businessId !== parseInt(businessId)) {
    res.status(403).json({ success: false, message: 'Acceso denegado: no es propietario de este recurso' });
    return;
  }

  next();
};
