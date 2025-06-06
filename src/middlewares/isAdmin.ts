import { Router, Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    auth?: {
        sessionClaims?: {
            publicMetadata?: {
                role?: string;
            };
        };
    };
}

export const isAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.auth?.sessionClaims?.publicMetadata?.role;
    if (role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
};
