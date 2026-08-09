import type { Response, NextFunction } from "express";
import type { CreateOrderDTO, CreateOrderResponseDTO, OrderResponseDTO, DashboardStatsResponseDTO, TransitionOrderDTO, SubmitCompletionDTO } from "../dto/order.dto";
import { type RequestWithUser } from "../types/user.interface";
import { type Role } from "../types/user.interface";
import { type HydratedDocument } from "mongoose";
import { type IOrder } from "../types/order.interface";
import AppError = require("../utils/appError");
import orderService = require("../services/order.service");
import dashboardStatsService = require("../services/dashboardStats.service");
import mapOrderToDTO = require("../utils/orderMapper");

class OrderController {
    async createOrder(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            // Validation
            if (!req.user || !req.user.id) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const customerId: string = req.user.id;
            const createOrderData: CreateOrderDTO = req.body;

            // Service execution
            const createdOrder: HydratedDocument<IOrder> = await orderService.createOrder(customerId, createOrderData);

            // Response
            const responseData: CreateOrderResponseDTO = {
                id: createdOrder.id,
                cleaningType: createdOrder.cleaningType,
                orderStatus: createdOrder.orderStatus,
                totalPrice: createdOrder.totalPrice,
                sofaCount: createdOrder.sofas.length,
            };

            res.status(201).json({
                success: true,
                message: "Order Created Successfully",
                data: responseData
            })

        } catch (err) {
            console.error("Order creation failed:", err);
            next(err);
        }
    }

    async getCustomerOrders(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const userId: string = req.user.id;
            const userRole: Role = req.user.role;

            const allOrders: HydratedDocument<IOrder>[] = await orderService.getOrders(userId, userRole, "customer");

            // Response
            const responseData: OrderResponseDTO[] = allOrders.map(mapOrderToDTO);

            res.status(200).json({
                success: true,
                message: "Customer orders fetched successfully",
                data: responseData
            });

        } catch (err) {
            console.error("Fetching customer orders failed:", err);
            next(err);
        }
    }

    async getInternalOrders(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const userId: string = req.user.id;
            const userRole: Role = req.user.role;

            const allOrders: HydratedDocument<IOrder>[] = await orderService.getOrders(userId, userRole, "internal");

            // Response
            const responseData: OrderResponseDTO[] = allOrders.map(mapOrderToDTO);

            res.status(200).json({
                success: true,
                message: "Internal orders fetched successfully",
                data: responseData
            });

        } catch (err) {
            console.error("Fetching internal orders failed:", err);
            next(err);
        }
    }

    async getOrderById(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }
            const userId: string = req.user.id;
            const userRole: Role = req.user.role;

            if (!req.params.id || typeof req.params.id !== "string") {
                throw new AppError(400, "Bad Request: Invalid order ID.");
            }

            const orderId: string = req.params.id;

            const orderDetails: HydratedDocument<IOrder> = await orderService.getOrderById(orderId, userId, userRole);

            const responseData: OrderResponseDTO = mapOrderToDTO(orderDetails);

            res.status(200).json({
                success: true,
                message: "Order details fetched successfully",
                data: responseData
            });
        } catch (err) {
            console.error("Fetching order by ID failed:", err);
            next(err);
        }
    }

    async transitionOrder(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const userId: string = req.user.id;
            const userRole: Role = req.user.role;

            if (!req.params.id || typeof req.params.id !== "string") {
                throw new AppError(400, "Bad Request: Invalid order ID.");
            }

            const orderId: string = req.params.id;
            const transitionData: TransitionOrderDTO = req.body;

            const updatedOrder = await orderService.transitionOrder(
                orderId,
                userId,
                userRole,
                transitionData,
            );

            const responseData: OrderResponseDTO = mapOrderToDTO(updatedOrder);

            res.status(200).json({
                success: true,
                message: "Status transitioned successfully",
                data: responseData
            });

        } catch (err) {
            console.error("Order transition Failed:", err);
            next(err);
        }
    }

    async submitCompletion(req: RequestWithUser, res: Response, next: NextFunction) {
        try {
            if (!req.user || !req.user.id || !req.user.role) {
                throw new AppError(401, "Unauthenticated: Please log in again.");
            }

            const userId: string = req.user.id;
            const userRole: Role = req.user.role;

            if (!req.params.id || typeof req.params.id !== "string") {
                throw new AppError(400, "Bad Request: Invalid order ID.");
            }

            const orderId: string = req.params.id;


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

            const updatedOrder = await orderService.submitCompletion(orderId, userId, userRole, completionData);

            // Response
            const responseData: OrderResponseDTO = mapOrderToDTO(updatedOrder);

            res.status(200).json({
                success: true,
                message: "Job submitted for review successfully.",
                data: responseData
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
                orders: dashboardStats.orders, // overview
                revenue: dashboardStats.revenue, // financials
                sofas: dashboardStats.sofas  // quality
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

export = new OrderController();