import type { Response, NextFunction } from "express";
import type { RequestWithUser, Role } from "../types/user.interface";
import AppError = require("../utils/appError");
import environment = require("../config/env");
import { type JwtPayload } from "jsonwebtoken"
import jwt = require("jsonwebtoken");
import mongoose = require("mongoose");

const requireAuth = (req: RequestWithUser, res: Response, next: NextFunction): void => {
    try {
        // check token
        const accessToken: string | undefined = req.cookies?.token;
        if (!accessToken) return next(new AppError(401, "Unauthenticated: Token missing!"));

        // Identify user
        const decoded: string | JwtPayload = jwt.verify(accessToken, environment.jwtSecret);

        if (typeof decoded === "string" || !decoded) {
            return next(new AppError(401, "Unauthenticated: Invalid token!"));
        }

        // Attach user to 'req'
        // 'user' exists because req is typed as RequestWithUser.
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        }

        next();
    } catch (err) {
        // Safely catch JsonWebTokenError or TokenExpiredError
        console.error("Authentication middleware failed:", err);
        return next(new AppError(401, "Unauthenticated: Token verification failed."));
    }
}

const requireRole = (allowedRoles: readonly Role[]) => (req: RequestWithUser, res: Response, next: NextFunction): void => {
    // Defensive check: Ensure requireAuth actually ran before this
    if (!req.user) return next(new AppError(401, "Unauthenticated: User context missing!"));

    // Check role
    if (!allowedRoles.includes(req.user.role)) return next(new AppError(403, "Forbidden: Access denied!"));

    // User is authorized, proceed to the controller
    next();
}

export = {
    requireAuth,
    requireRole
}