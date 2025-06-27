import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../utils/types';



const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.cookies.jwtToken;

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as { id: string; role: string; userName: string };
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export default verifyToken;