import type { Request, Response, NextFunction } from "express";
import type { RegisterDTO, RegisterResponseDTO, LoginDTO, LoginResponseDTO } from "../dto/auth.dto";
import authService = require("../services/auth.service");
import { type IUser } from "../types/user.interface";
import { type TimestampedDocument } from "../types/mongoose.types";

class AuthController {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            // Request 
            const registerData: RegisterDTO = req.body;
            const profilePictureFile: Express.Multer.File | undefined = req.file;

            // Service call
            const registeredUser: TimestampedDocument<IUser> = await authService.register(registerData, profilePictureFile);

            // Response
            const registerResponse: RegisterResponseDTO = {
                id: registeredUser._id.toString(),
                email: registeredUser.email,
                fullName: registeredUser.fullName,
                role: registeredUser.role,
                profilePicture: registeredUser.profilePicture,
                createdAt: registeredUser.createdAt
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

            // Service call
            const { loggedInUser, accessToken }: { loggedInUser: TimestampedDocument<IUser>, accessToken: string } = await authService.login(loginData);

            // Response
            const loginResponse: LoginResponseDTO = {
                id: loggedInUser.id,
                fullName: loggedInUser.fullName,
                email: loggedInUser.email,
                profilePicture: loggedInUser.profilePicture,
                role: loggedInUser.role,
                createdAt: loggedInUser.createdAt,
            }

            // Set-Cookie
            res.cookie("token", accessToken, {
                httpOnly: true, // Prevents JavaScript from reading the cookie (XSS protection)
                secure: false, // Requires HTTPS in production
                sameSite: "strict", // Protects against Cross-Site Request Forgery (CSRF)
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
}

export = new AuthController();