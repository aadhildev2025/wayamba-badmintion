"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.restrictTo = exports.optionalAuth = exports.protect = exports.ALL_PERMISSIONS = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
exports.ALL_PERMISSIONS = ['dashboard', 'products', 'orders', 'reports', 'coupons', 'staff'];
const protect = async (req, res, next) => {
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
            permissions: exports.ALL_PERMISSIONS,
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'super_secret_badminton_key_123!');
        req.user = {
            id: decoded.id,
            role: decoded.role,
            permissions: decoded.permissions || [],
        };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
};
exports.protect = protect;
const optionalAuth = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
        if (token === 'demo_admin_jwt_token_999') {
            req.user = {
                id: '650000000000000000000001',
                role: 'SUPER_ADMIN',
                permissions: exports.ALL_PERMISSIONS,
            };
        }
        else if (token === 'demo_staff_jwt_token_888') {
            req.user = {
                id: '650000000000000000000002',
                role: 'STAFF',
                permissions: ['dashboard', 'products', 'orders'],
            };
        }
        else {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'super_secret_badminton_key_123!');
                req.user = {
                    id: decoded.id,
                    role: decoded.role,
                    permissions: decoded.permissions || [],
                };
            }
            catch (error) {
                // Token invalid/expired - proceed as guest
            }
        }
    }
    next();
};
exports.optionalAuth = optionalAuth;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ message: `Forbidden: role '${req.user?.role || 'Guest'}' lacks access` });
            return;
        }
        next();
    };
};
exports.restrictTo = restrictTo;
const requirePermission = (permission) => {
    return async (req, res, next) => {
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
                    const dbUser = await User_1.default.findById(req.user.id).select('permissions');
                    userPermissions = dbUser?.permissions || [];
                    req.user.permissions = userPermissions;
                }
                catch (err) {
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
exports.requirePermission = requirePermission;
