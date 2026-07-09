import type { Response, NextFunction } from "express";
import type { CreateRequestDTO, CreateRequestResponseDTO, TransitionRequestDTO, SubmitCompletionDTO } from "../dto/request.dto";
import { type RequestWithUser } from "../types/user.interface";
import { type Role } from "../types/user.interface";
import { type HydratedDocument } from "mongoose";
import { type ICleaningRequest } from "../types/request.interface";
import { type DashboardStatsResponseDTO } from "../dto/request.dto";
import AppError = require("../utils/AppError");
import requestService = require("../services/request.service");
import dashboardStatsService = require("../services/dashboardStats.service");

class RequestController {
    async createRequest(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            // Validation
            if (!req.user || !req.user.id) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const customerId: string = req.user.id;
            const createRequestData: CreateRequestDTO = req.body;

            // Service execution
            const createdRequest: HydratedDocument<ICleaningRequest> = await requestService.createRequest(customerId, createRequestData);

            // Response
            const responseData: CreateRequestResponseDTO = {
                id: createdRequest.id,
                cleaningType: createdRequest.cleaningType,
                overallStatus: createdRequest.overallStatus,
                totalPrice: createdRequest.totalPrice,
                sofaCount: createdRequest.sofas.length,
            };

            res.status(201).json({
                success: true,
                message: "Request Created Successfully",
                data: responseData
            })

        } catch (err) {
            console.error("Request creation failed:", err);
            next(err);
        }
    }

    async getCustomerRequests(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const userId: string = req.user.id;
            const userRole: Role = req.user.role;

            const allRequests: HydratedDocument<ICleaningRequest>[] = await requestService.getRequests(userId, userRole, "customer");

            res.status(200).json({
                success: true,
                message: "Customer requests fetched successfully",
                data: allRequests
            });

        } catch (err) {
            console.error("Fetching customer requests failed:", err);
            next(err);
        }
    }

    async getInternalRequests(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const userId: string = req.user.id;
            const userRole: Role = req.user.role;

            const allRequests: HydratedDocument<ICleaningRequest>[] = await requestService.getRequests(userId, userRole, "internal");

            res.status(200).json({
                success: true,
                message: "Internal requests fetched successfully",
                data: allRequests
            });

        } catch (err) {
            console.error("Fetching internal requests failed:", err);
            next(err);
        }

    }

    async getRequestById(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }
            const userId: string = req.user.id;
            const userRole: Role = req.user.role;

            if (!req.params.id || typeof req.params.id !== "string") {
                throw new AppError(400, "Bad Request: Invalid request ID.");
            }

            const requestId: string = req.params.id;

            const requestDetails: HydratedDocument<ICleaningRequest> = await requestService.getRequestById(requestId, userId, userRole);

            res.status(200).json({
                success: true,
                message: "Request details fetched successfully",
                data: requestDetails
            });
        } catch (err) {
            console.error("Fetching request by ID failed:", err);
            next(err);
        }
    }

    async transitionRequest(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const userId: string = req.user.id;
            const userRole: Role = req.user.role;

            if (!req.params.id || typeof req.params.id !== "string") {
                throw new AppError(400, "Bad Request: Invalid request ID.");
            }

            const requestId: string = req.params.id;
            const transitionData: TransitionRequestDTO = req.body;

            const updatedRequest = await requestService.transitionRequest(
                requestId,
                userId,
                userRole,
                transitionData,
            );

            res.status(200).json({
                success: true,
                message: "Status transitioned successfully",
                data: updatedRequest
            });

        } catch (err) {
            console.error("Request transition Failed:", err);
            next(err);
        }
    }

    async submitCompletion(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const userId: string = req.user.id;

            if (!req.params.id || typeof req.params.id !== "string") {
                throw new AppError(400, "Bad Request: Invalid request ID.");
            }

            const requestId: string = req.params.id;


            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                throw new AppError(400, "Bad Request: No images uploaded.");
            }

            const proofFiles: Express.Multer.File[] = req.files;

            // Parse healthScores from the form-data string
            let parsedHealthScores: Record<string, number> = {};
            if (req.body.healthScores) {
                try {
                    parsedHealthScores = JSON.parse(req.body.healthScores);
                } catch (parseError) {
                    throw new AppError(400, "Bad Request: Invalid healthScores JSON format.");
                }
            }

            const completionData: SubmitCompletionDTO = {
                proofFiles: proofFiles,
                healthScores: parsedHealthScores
            };

            const updatedRequest = await requestService.submitCompletion(requestId, userId, completionData);

            res.status(200).json({
                success: true,
                message: "Job submitted for review successfully.",
                data: updatedRequest
            });

        } catch (err) {
            console.error("Submit completion failed:", err);
            next(err);
        }
    }

    async getDashboardStats(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const dashboardStats = await dashboardStatsService.getDashboardStats();

            const responseData: DashboardStatsResponseDTO = {
                overview: dashboardStats.overview,
                financials: dashboardStats.financials,
                quality: dashboardStats.quality
            };

            res.status(200).json({
                success: true,
                message: "Dashboard stats fetched successfully",
                data: responseData
            });

        } catch (err) {
            console.error("Fetching dashboard stats failed:", err);
            next(err);
        }
    }
}

export = new RequestController();