import type { CreateOrderDTO, TransitionOrderDTO, SubmitCompletionDTO } from "../dto/order.dto";
import orderRepository = require("../repositories/order.repository");
import type { ISofaItem, IStatusEvent } from "../types/order.interface";
import { type IOrder } from "../types/order.interface";
import { type HydratedDocument } from "mongoose";
import AppError = require("../utils/appError");
import { type Role } from "../types/user.interface";
import userRepository = require("../repositories/user.repository");
import imageService = require("./image.service");
import dashboardStatsService = require("./dashboardStats.service");
import mongoose = require("mongoose");

const SOFA_CLEANING_PRICES: Record<string, number> = {
    "Deep Cleaning": 1000,
    "Steam Cleaning": 1500,
    "Shampoo Cleaning": 1200,
    "Dry Cleaning": 1100,
    "Leather Cleaning & Conditioning": 2000,
};

class OrderService {
    async createOrder(customerId: string, createOrderData: CreateOrderDTO): Promise<HydratedDocument<IOrder>> {
        const foundCustomer = await userRepository.findById(customerId);

        if (!foundCustomer) throw new AppError(401, "Unauthenticated: Please log in again.");

        const pricePerSofa: number | undefined = SOFA_CLEANING_PRICES[createOrderData.cleaningType];
        if (!pricePerSofa) throw new AppError(400, "Bad Request: Wrong cleaning type!");

        if (!createOrderData.customerAddress) throw new AppError(400, "Bad Request: Customer address is required.")

        const calculatedTotal = createOrderData.sofaCount * pricePerSofa;

        const generatedSofas: ISofaItem[] = Array.from({ length: createOrderData.sofaCount }).map((_, index) => ({
            sofaId: `SOFA-${index + 1}`,
            status: "pending",
            healthScore: null,
            images: { before: null, after: null }
        }));

        const creationStatus: IStatusEvent = {
            step: "pending",
            label: "Order Created",
            icon: "📥",
            timestamp: new Date()
        };

        const orderData: IOrder = {
            customer: { id: customerId, fullName: foundCustomer.fullName },
            customerAddress: createOrderData.customerAddress,
            cleaningType: createOrderData.cleaningType,
            orderStatus: "pending",
            fieldCleaner: { id: null, fullName: null },
            manager: { id: null, fullName: null },
            cleaningDate: null,
            totalPrice: calculatedTotal,
            statusEvents: [creationStatus],
            sofas: generatedSofas,
        };

        const createdOrder: HydratedDocument<IOrder> = await orderRepository.create(orderData);

        await dashboardStatsService.recordNewOrder(); // Dashboard stats

        return createdOrder;
    }

    async getOrders(userId: string, userRole: Role, viewContext: "customer" | "internal"): Promise<HydratedDocument<IOrder>[]> {
        let baseFilters: Object = {};

        if (viewContext === "customer") {
            baseFilters = { "customer.id": userId }; // Using dot notation due to nested schema fields
        }
        else if (viewContext === "internal") {
            if (userRole === "Field_Cleaner") {
                baseFilters = { "fieldCleaner.id": userId };
            } else if (userRole === "Manager" || userRole === "Owner") {
                baseFilters = {}; // Owners/Managers can see all orders
            }
        } else {
            baseFilters = { customerId: userId };
        }

        const allOrders = await orderRepository.findByFilters(baseFilters);

        return allOrders;
    }

    async getOrderById(orderId: string, userId: string, userRole: Role): Promise<HydratedDocument<IOrder>> {
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            throw new AppError(400, "Bad Request: Invalid order id.");
        }

        const foundOrder: HydratedDocument<IOrder> | null = await orderRepository.findById(orderId);

        if (!foundOrder) throw new AppError(404, "Resource: Order does not exist.");

        if (userRole === "Customer") {
            const orderCustomerId: string = foundOrder.customer.id;
            if (orderCustomerId !== userId) {
                throw new AppError(403, "Unauthorized: You can only view your own orders.");
            }
        } else if (userRole === "Field_Cleaner") {
            if (!foundOrder.fieldCleaner.id) {
                throw new AppError(403, "Unauthorized: This order has not been assigned yet.");
            }

            const fieldCleanerId: string = foundOrder.fieldCleaner.id;

            if (fieldCleanerId !== userId) {
                throw new AppError(403, "Unauthorized: This order is not assigned to you.");
            }
        } else if (userRole === "Manager") {
            // allowed

        } else if (userRole === "Owner") {
            // allowed

        } else {
            throw new AppError(403, "Unauthorized: You don't have access to this order.");
        }

        return foundOrder;
    }

    async transitionOrder(orderId: string, userId: string, userRole: Role, transitionData: TransitionOrderDTO): Promise<HydratedDocument<IOrder>> {
        const foundOrder: HydratedDocument<IOrder> | null = await orderRepository.findById(orderId);
        if (!foundOrder) throw new AppError(404, "Resource: Order does not exist.");

        const foundUser = await userRepository.findById(userId);
        if (!foundUser) throw new AppError(401, "Unauthenticated: Please log in again.");

        const isOwner = userRole === "Owner";
        const isManager = userRole === "Manager";
        const isAssignedCleaner = userRole === "Field_Cleaner" && foundOrder.fieldCleaner && foundOrder.fieldCleaner.id === userId;

        const allowedTransitions: Record<TransitionOrderDTO["transition"], string[]> = {
            "approve": ["pending"],
            "reject": ["pending"],
            "assign": ["approved", "reclean"], // This allows Step 3 AND the Step 7 Reclean Loop!
            "start": ["assigned"],
            "complete": ["review"],
            "reclean": ["review"]
        };

        const currentValidStatuses = allowedTransitions[transitionData.transition];

        if (!currentValidStatuses.includes(foundOrder.orderStatus)) {
            throw new AppError(400, "Bad Request: Invalid transition.");
        };

        const now = new Date();
        const oldStatus = foundOrder.orderStatus;
        let newStatusEvent: IStatusEvent;

        switch (transitionData.transition) {
            case "approve":
                if (!isManager && !isOwner) throw new AppError(403, "Unauthorized: You can't approve orders.");
                foundOrder.orderStatus = "approved";
                foundOrder.manager = { id: userId, fullName: foundUser.fullName }
                newStatusEvent = { step: "approved", label: "Order Approved", icon: "✅", timestamp: now };
                break;

            case "reject":
                if (!isManager && !isOwner) throw new AppError(403, "Unauthorized: You can't reject orders.");
                foundOrder.orderStatus = "rejected";
                foundOrder.manager = { id: userId, fullName: foundUser.fullName }
                newStatusEvent = { step: "rejected", label: "Order Rejected", icon: "❌", timestamp: now };
                break;

            case "assign":
                if (!isManager && !isOwner) throw new AppError(403, "Unauthorized: You can't assign orders.");
                foundOrder.orderStatus = "assigned";
                foundOrder.fieldCleaner = transitionData.fieldCleaner;
                foundOrder.manager = { id: userId, fullName: foundUser.fullName }
                foundOrder.cleaningDate = transitionData.cleaningDate;
                const recleanCount = foundOrder.statusEvents.filter(statusEvent => statusEvent.step === "reclean").length;
                newStatusEvent = { step: "assigned", label: recleanCount > 0 ? `Reclean Assignment - ${recleanCount}` : "Cleaner Assigned", icon: "📅", timestamp: now };
                break;

            case "start":
                if (!isAssignedCleaner && !isManager && !isOwner) throw new AppError(403, "Unauthorized: You can't start a order.");
                foundOrder.orderStatus = "in-progress";
                newStatusEvent = { step: "in-progress", label: "Cleaning Started", icon: "🧼", timestamp: now };
                break;

            case "complete":
                if (!isManager && !isOwner) throw new AppError(403, "Unauthorized: You can't close orders.");
                foundOrder.orderStatus = "completed";
                newStatusEvent = { step: "completed", label: "Order Completed Successfully", icon: "🎉", timestamp: now };
                break;

            case "reclean":
                if (!isManager && !isOwner) throw new AppError(403, "Unauthorized: You can't initiate a order reclean.");
                foundOrder.orderStatus = "reclean";
                foundOrder.fieldCleaner = { id: null, fullName: null };
                foundOrder.sofas.forEach(sofa => {
                    if (transitionData.failedSofas.includes(sofa.sofaId)) {
                        sofa.status = "reclean-required";
                    }
                })
                newStatusEvent = { step: "reclean", label: "Reclean Required", icon: "⚠️", timestamp: now };
                break;

            default: throw new AppError(400, "Bad Request: Invalid transition.");
        }

        foundOrder.statusEvents.push(newStatusEvent);
        await foundOrder.save();

        // Dashboard states
        await dashboardStatsService.recordStatusTransition(oldStatus, foundOrder.orderStatus);

        if (transitionData.transition === "complete") {
            await dashboardStatsService.recordCompleted(foundOrder.totalPrice, foundOrder.sofas.length);
        }

        if (transitionData.transition === "reclean") {
            await dashboardStatsService.recordReclean(transitionData.failedSofas.length);
        }

        return foundOrder;
    }

    async submitCompletion(orderId: string, userId: string, userRole: Role, completionData: SubmitCompletionDTO): Promise<HydratedDocument<IOrder>> {
        const foundOrder = await orderRepository.findById(orderId);
        if (!foundOrder) throw new AppError(404, "Resource: Order does not exist.");

        const isOwner = userRole === "Owner";
        const isManager = userRole === "Manager";
        const isAssignedCleaner = userRole === "Field_Cleaner" && foundOrder.fieldCleaner && foundOrder.fieldCleaner.id === userId;

        if (!isAssignedCleaner && !isManager && !isOwner) {
            throw new AppError(403, "Unauthorized: You cannot submit this order for review.");
        }

        if (foundOrder.orderStatus !== "in-progress") {
            throw new AppError(400, "Bad Request: Only orders in progress can be completed.");
        }

        const uploadPromises = completionData.proofFiles.map(async (file) => {
            const fieldName: string = file.fieldname; // e.g., "before_SOFA-1"
            const parts: string[] = fieldName.split("_");

            if (parts.length !== 2) {
                throw new AppError(400, "Bad Request: Invalid image field format.");
            }

            const imageType = parts[0]; // "before" or "after"
            const sofaId = parts[1];    // "SOFA-1"

            if (imageType !== "before" && imageType !== "after") {
                throw new AppError(400, "Bad Request: Image type must be 'before' or 'after'.");
            }

            const targetSofa = foundOrder.sofas.find(s => s.sofaId === sofaId);

            if (!targetSofa) {
                throw new AppError(400, "Bad Request: Invalid sofa ID provided.");
            }

            const imageUrl = await imageService.uploadImage(file.buffer, fieldName, "sofa_cleaning_orders");

            if (imageType === "before") {
                targetSofa.images.before = imageUrl;
            } else {
                targetSofa.images.after = imageUrl;
            }

            targetSofa.status = "completed";
        })

        await Promise.all(uploadPromises);

        // Apply health scores mapping
        for (const [sofaId, score] of Object.entries(completionData.healthScores)) {
            const targetSofa = foundOrder.sofas.find(s => s.sofaId === sofaId);
            if (!targetSofa) {
                throw new AppError(400, "Bad Request: Provided health score for unknown Sofa ID.");
            }
            targetSofa.healthScore = score;
        }

        const oldStatus = foundOrder.orderStatus;
        foundOrder.orderStatus = "review";

        const reviewStatusEvent: IStatusEvent = {
            step: "review",
            label: "Pending Review",
            icon: "🔍",
            timestamp: new Date()
        };

        foundOrder.statusEvents.push(reviewStatusEvent);

        // Explicitly tell Mongoose the array was modified so it doesn't skip the save. as we mutating nestead property
        foundOrder.markModified("sofas");

        await foundOrder.save();

        await dashboardStatsService.recordStatusTransition(oldStatus, foundOrder.orderStatus); // Dashboard stats

        return foundOrder;

    }
}

export = new OrderService();