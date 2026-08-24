import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN';
  };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_badminton_key_123!') as {
      id: string;
      role: 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN';
    };

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token validation failed' });
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_badminton_key_123!') as {
        id: string;
        role: 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN';
      };

      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
    } catch (error) {
      // Token invalid/expired - proceed as guest
    }
  }
  next();
};

export const restrictTo = (...roles: Array<'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: `Forbidden: role '${req.user?.role || 'Guest'}' lacks access` });
      return;
    }
    next();
  };
};
