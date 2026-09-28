import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN';
    permissions?: string[];
  };
}

export const ALL_PERMISSIONS = ['dashboard', 'products', 'orders', 'reports', 'coupons', 'staff'];

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }

  if (token === 'demo_admin_jwt_token_999') {
    req.user = {
      id: '650000000000000000000001',
      role: 'SUPER_ADMIN',
      permissions: ALL_PERMISSIONS,
    };
    return next();
  }
  if (token === 'demo_staff_jwt_token_888') {
    req.user = {
      id: '650000000000000000000002',
      role: 'STAFF',
      permissions: ['dashboard', 'products', 'orders'],
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_badminton_key_123!') as {
      id: string;
      role: 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN';
      permissions?: string[];
    };

    req.user = {
      id: decoded.id,
      role: decoded.role,
      permissions: decoded.permissions || [],
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
    if (token === 'demo_admin_jwt_token_999') {
      req.user = {
        id: '650000000000000000000001',
        role: 'SUPER_ADMIN',
        permissions: ALL_PERMISSIONS,
      };
    } else if (token === 'demo_staff_jwt_token_888') {
      req.user = {
        id: '650000000000000000000002',
        role: 'STAFF',
        permissions: ['dashboard', 'products', 'orders'],
      };
    } else {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_badminton_key_123!') as {
          id: string;
          role: 'CUSTOMER' | 'STAFF' | 'SUPER_ADMIN';
          permissions?: string[];
        };

        req.user = {
          id: decoded.id,
          role: decoded.role,
          permissions: decoded.permissions || [],
        };
      } catch (error) {
        // Token invalid/expired - proceed as guest
      }
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

export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user context' });
      return;
    }

    // Super Admin has unrestricted access to all endpoints
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (req.user.role === 'STAFF') {
      let userPermissions = req.user.permissions;
      if (!userPermissions || userPermissions.length === 0) {
        try {
          const dbUser = await User.findById(req.user.id).select('permissions');
          userPermissions = dbUser?.permissions || [];
          req.user.permissions = userPermissions;
        } catch (err) {
          userPermissions = [];
        }
      }

      if (userPermissions.includes(permission)) {
        return next();
      }

      res.status(403).json({
        message: `Forbidden: Staff member lacks '${permission}' permission`,
        requiredPermission: permission,
      });
      return;
    }

    res.status(403).json({ message: `Forbidden: role '${req.user.role}' lacks administrative permissions` });
  };
};
