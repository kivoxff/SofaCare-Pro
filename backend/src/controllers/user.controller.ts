import type { RequestWithUser } from "../types/user.interface";
import type { Response, NextFunction } from "express";
import AppError = require("../utils/AppError");
import { type Role } from "../types/user.interface";
import { type IUser } from "../types/user.interface";
import { type TimestampedDocument } from "../types/mongoose.types";
import userService = require("../services/user.service");
import { type UserResponseDTO } from "../dto/user.dto";
import { type WithTimestamps } from "../types/mongoose.types";

class UserController {
    async updateRole(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            // Validation
            if (!req.user || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const updaterRole: Role = req.user.role;

            if (!req.params.id || typeof req.params.id !== "string") {
                throw new AppError(400, "Bad Request: Invalid targeted user ID.");
            }

            const targetUserId: string = req.params.id;

            const newRole: Role = req.body.role;

            if (!newRole) throw new AppError(400, "Bad Request: Role is required.");

            const allowedRoles: Role[] = ["Customer", "Field_Cleaner", "Manager", "Owner"];
            if (!allowedRoles.includes(newRole)) throw new AppError(400, "Bad Request: Invalid role.");

            // Service call
            const updatedUser: TimestampedDocument<IUser> = await userService.updateRole(targetUserId, newRole, updaterRole);

            // Response
            const responseData: WithTimestamps<UserResponseDTO> = {
                id: updatedUser._id.toString(),
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                role: updatedUser.role,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt
            }

            res.status(200).json({
                success: true,
                message: "User role updated successfully",
                data: responseData
            })

        } catch (err) {
            console.error("User role update failed:", err);
            next(err);
        }
    }

    async getUsersByRole(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            if (!req.params.role || typeof req.params.role !== "string") {
                throw new AppError(400, "Bad Request: Invalid user role.");
            }

            const requestedRole: string = req.params.role;
            const allowedParameters = ["All", "Customer", "Field_Cleaner", "Manager", "Owner"];

            if (!allowedParameters.includes(requestedRole)) {
                throw new AppError(400, "Bad Request: Invalid user role.");
            }

            const foundUsers: TimestampedDocument<IUser>[] = await userService.getUsersByRole(requestedRole);

            const responseData: WithTimestamps<UserResponseDTO>[] = foundUsers.map((user: TimestampedDocument<IUser>) => ({
                id: user._id.toString(),
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }));

            res.status(200).json({
                success: true,
                message: "Users fetched successfully",
                data: responseData
            });

        } catch (err) {
            console.error("Fetching users by role failed:", err);
            next(err);
        }
    }
}

export = new UserController();