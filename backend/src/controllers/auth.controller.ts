import type { Request, Response, NextFunction } from "express";
import type { RegisterDTO, RegisterResponseDTO, LoginDTO, LoginResponseDTO } from "../dto/auth.dto";
import { type IUser } from "../types/user.interface";
import { type TimestampedDocument } from "../types/mongoose.types";
import { type RequestWithUser } from "../types/user.interface";
import authService = require("../services/auth.service");
import AppError = require("../utils/appError");
import environment = require("../config/env");

class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            // Request 
            const registerData: RegisterDTO = req.body;
            const profileImageFile: Express.Multer.File | undefined = req.file;

            // Validation
            if (!registerData.email || !registerData.password) {
                throw new AppError(400, "Bad Request: Email and password are required.");
            }

            if(!registerData.fullName) {
                throw new AppError(400, "Bad Request: Full name is required.");
            }

            // Service call
            const registeredUser: TimestampedDocument<IUser> = await authService.register(registerData, profileImageFile);

            // Response
            const registerResponse: RegisterResponseDTO = {
                id: registeredUser._id.toString(),
                email: registeredUser.email,
                fullName: registeredUser.fullName,
                role: registeredUser.role,
                profileImage: registeredUser.profileImage,
                createdAt: registeredUser.createdAt.toISOString()
            }

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: registerResponse
            })

        } catch (err) {
            console.error("User registration failed:", err);
            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            // Request
            const loginData: LoginDTO = req.body;

             // Validation
            if (!loginData.email || !loginData.password) {
                throw new AppError(400, "Bad Request: Email and password are required.");
            }

            // Service call
            const { loggedInUser, accessToken }: { loggedInUser: TimestampedDocument<IUser>, accessToken: string } = await authService.login(loginData);

            // Response
            const loginResponse: LoginResponseDTO = {
                id: loggedInUser.id,
                fullName: loggedInUser.fullName,
                email: loggedInUser.email,
                profileImage: loggedInUser.profileImage,
                role: loggedInUser.role,
                createdAt: loggedInUser.createdAt.toISOString(),
            }

            // Set-Cookie
            res.cookie("token", accessToken, {
                httpOnly: true, // Prevents JavaScript from reading the cookie (XSS protection)
                secure: environment.cookieSecure, // Requires HTTPS in production
                sameSite: environment.cookieSameSite, // Protects against Cross-Site Request Forgery (CSRF)
                maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds (match this to JWT expiration)
            })

            res.status(200).json({
                success: true,
                message: "User logged in successfully",
                data: loginResponse
            })

        } catch (err) {
            console.error("User login failed:", err);
            next(err);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            // Clear cookie  
            res.clearCookie("token", {
                httpOnly: true,
                secure: false,
                sameSite: "strict"
            })

            res.status(200).json({
                success: true,
                message: "User logged out successfully"
            })
        } catch (err) {
            console.error("User logout failed:", err);
            next(err);
        }
    }

    async getMe(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            // Extra safety check after requireAuth
            if (!req.user || !req.user.id) {
                throw new AppError(401, "Unauthenticated: User context missing.");
            }

            // Service call
            const loggedInUser: TimestampedDocument<IUser> = await authService.getMe(req.user.id);

            const responseData: LoginResponseDTO = {
                id: loggedInUser._id.toString(),
                email: loggedInUser.email,
                fullName: loggedInUser.fullName,
                role: loggedInUser.role,
                profileImage: loggedInUser.profileImage,
                createdAt: loggedInUser.createdAt.toISOString()
            }

            res.status(200).json({
                success: true,
                message: "Current user fetched successfully",
                data: responseData
            });

        } catch (err) {
            console.error("Fetching current user failed:", err);
            next(err);
        }
    }
}

export = new AuthController();