import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthenticatedRequest } from '../utils/types';

const checkRole = (allowedRoles: string[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
      return;
    }
    next();
  };
};

export default checkRole;
