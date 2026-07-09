import type { CreateRequestDTO, TransitionRequestDTO, SubmitCompletionDTO } from "../dto/request.dto";
import requestRepository = require("../repositories/request.repository");
import type { ISofaItem, IStatusEvent } from "../types/request.interface";
import { type ICleaningRequest } from "../types/request.interface";
import { type HydratedDocument } from "mongoose";
import AppError = require("../utils/AppError");
import { type Role } from "../types/user.interface";
import userRepository = require("../repositories/user.repository");
import imageService = require("./image.service");
import dashboardStatsService = require("./dashboardStats.service");

const SOFA_CLEANING_PRICES: Record<string, number> = {
    "Deep Cleaning": 1000,
    "Steam Cleaning": 1500,
    "Shampoo Cleaning": 1200,
    "Dry Cleaning": 1100,
    "Leather Cleaning & Conditioning": 2000,
};

class RequestService {
    async createRequest(customerId: string, createRequestData: CreateRequestDTO): Promise<HydratedDocument<ICleaningRequest>> {
        const foundCustomer = await userRepository.findById(customerId);

        if (!foundCustomer) throw new AppError(401, "Unauthenticated: Please log in again.");

        const pricePerSofa: number | undefined = SOFA_CLEANING_PRICES[createRequestData.cleaningType];
        if (!pricePerSofa) throw new AppError(400, "Bad Request: Wrong cleaning type!");

        const calculatedTotal = createRequestData.numberOfSofas * pricePerSofa;

        const generatedSofas: ISofaItem[] = Array.from({ length: createRequestData.numberOfSofas }).map((_, index) => ({
            sofaId: `SOFA-${index + 1}`,
            status: "pending",
            healthScore: null,
            images: { before: null, after: null }
        }));

        const creationStatus: IStatusEvent = {
            step: "pending",
            label: "Request Created",
            icon: "📥",
            timestamp: new Date()
        };

        const requestData: ICleaningRequest = {
            customer: { id: customerId, fullName: foundCustomer.fullName },
            cleaningType: createRequestData.cleaningType,
            overallStatus: "pending",
            fieldCleaner: { id: null, fullName: null },
            manager: { id: null, fullName: null },
            cleaningDate: null,
            totalPrice: calculatedTotal,
            statusEvents: [creationStatus],
            sofas: generatedSofas,
        };

        const createdRequest: HydratedDocument<ICleaningRequest> = await requestRepository.create(requestData);

        await dashboardStatsService.recordNewRequest(); // Dashboard stats

        return createdRequest;
    }

    async getRequests(userId: string, userRole: Role, viewContext: "customer" | "internal"): Promise<HydratedDocument<ICleaningRequest>[]> {
        let baseFilters: Object = {};

        if (viewContext === "customer") {
            baseFilters = { "customer.id": userId }; // Using dot notation due to nested schema fields
        }
        else if (viewContext === "internal") {
            if (userRole === "Field_Cleaner") {
                baseFilters = { "fieldCleaner.id": userId };
            } else if (userRole === "Manager" || userRole === "Owner") {
                baseFilters = {}; // Owners/Managers can see all request
            }
        } else {
            baseFilters = { customerId: userId };
        }

        const allRequests = await requestRepository.findByFilters(baseFilters);

        return allRequests;
    }

    async getRequestById(requestId: string, userId: string, userRole: Role): Promise<HydratedDocument<ICleaningRequest>> {
        const foundRequest: HydratedDocument<ICleaningRequest> | null = await requestRepository.findById(requestId);

        if (!foundRequest) throw new AppError(404, "Resource: Request does not exist.");

        if (userRole === "Customer") {
            const requestCustomerId: string = foundRequest.customer.id;
            if (requestCustomerId !== userId) {
                throw new AppError(403, "Unauthorized: You can only view your own requests.");
            }
        } else if (userRole === "Field_Cleaner") {
            if (!foundRequest.fieldCleaner.id) {
                throw new AppError(403, "Unauthorized: This request has not been assigned yet.");
            }

            const fieldCleanerId: string = foundRequest.fieldCleaner.id;

            if (fieldCleanerId !== userId) {
                throw new AppError(403, "Unauthorized: This request is not assigned to you.");
            }
        } else if (userRole === "Manager") {
            // allowed

        } else if (userRole === "Owner") {
            // allowed

        } else {
            throw new AppError(403, "Unauthorized: You don't have access to this request.");
        }

        return foundRequest;
    }

    async transitionRequest(requestId: string, userId: string, userRole: Role, transitionData: TransitionRequestDTO): Promise<HydratedDocument<ICleaningRequest>> {
        const foundRequest: HydratedDocument<ICleaningRequest> | null = await requestRepository.findById(requestId);
        if (!foundRequest) throw new AppError(404, "Resource: Request does not exist.");

        const foundUser = await userRepository.findById(userId);
        if (!foundUser) throw new AppError(401, "Unauthenticated: Please log in again.");

        const isOwner = userRole === "Owner";
        const isManager = userRole === "Manager";
        const isAssignedCleaner = userRole === "Field_Cleaner" && foundRequest.fieldCleaner && foundRequest.fieldCleaner.id === userId;

        const allowedTransitions: Record<TransitionRequestDTO["transition"], string[]> = {
            "approve": ["pending"],
            "reject": ["pending"],
            "assign": ["approved", "reclean"], // This allows Step 3 AND the Step 7 Reclean Loop!
            "start": ["assigned"],
            "complete": ["review"],
            "reclean": ["review"]
        };

        const currentValidStatuses = allowedTransitions[transitionData.transition];

        if (!currentValidStatuses.includes(foundRequest.overallStatus)) {
            throw new AppError(400, "Bad Request: Invalid transition.");
        };

        const now = new Date();
        const oldStatus = foundRequest.overallStatus;
        let newStatusEvent: IStatusEvent;

        switch (transitionData.transition) {
            case "approve":
                if (!isManager && !isOwner) throw new AppError(403, "Unauthorized: You can't approve requests.");
                foundRequest.overallStatus = "approved";
                newStatusEvent = { step: "approved", label: "Request Approved", icon: "✅", timestamp: now };
                break;

            case "reject":
                if (!isManager && !isOwner) throw new AppError(403, "Unauthorized: You can't reject requests.");
                foundRequest.overallStatus = "rejected";
                newStatusEvent = { step: "rejected", label: "Request Rejected", icon: "❌", timestamp: now };
                break;

            case "assign":
                if (!isManager && !isOwner) throw new AppError(403, "Unauthorized: You can't assign requests.");
                foundRequest.overallStatus = "assigned";
                foundRequest.fieldCleaner = transitionData.fieldCleaner;
                foundRequest.manager = { id: userId, fullName: foundUser.fullName }
                foundRequest.cleaningDate = transitionData.cleaningDate;
                newStatusEvent = { step: "assigned", label: "Cleaner Assigned", icon: "📅", timestamp: now };
                break;

            case "start":
                if (!isAssignedCleaner) throw new AppError(403, "Unauthorized: You can't start a request.");
                foundRequest.overallStatus = "in-progress";
                newStatusEvent = { step: "in-progress", label: "Cleaning Started", icon: "🧼", timestamp: now };
                break;

            case "complete":
                if (!isManager && !isOwner) throw new AppError(403, "Unauthorized: You can't close requests.");
                foundRequest.overallStatus = "closed";
                newStatusEvent = { step: "closed", label: "Job Completed Successfully", icon: "🎉", timestamp: now };
                break;

            case "reclean":
                if (!isManager && !isOwner) throw new AppError(403, "Unauthorized: You can't initiate a request reclean.");
                foundRequest.overallStatus = "reclean";
                foundRequest.sofas.forEach(sofa => {
                    if (transitionData.failedSofas.includes(sofa.sofaId)) {
                        sofa.status = "reclean-required";
                    }
                })
                newStatusEvent = { step: "reclean", label: "Reclean Required", icon: "⚠️", timestamp: now };
                break;

            default:
                throw new AppError(400, "Bad Request: Invalid transition.");
        }

        foundRequest.statusEvents.push(newStatusEvent);
        await foundRequest.save();

        // Dashboard states
        await dashboardStatsService.recordStatusTransition(oldStatus, foundRequest.overallStatus);

        if(transitionData.transition === "complete") {
            await dashboardStatsService.recordCompleted(foundRequest.totalPrice, foundRequest.sofas.length);
        }

        if(transitionData.transition === "reclean") {
            await dashboardStatsService.recordReclean(transitionData.failedSofas.length);
        }

        return foundRequest;
    }

    async submitCompletion(requestId: string, cleanerId: string, completionData: SubmitCompletionDTO): Promise<HydratedDocument<ICleaningRequest>> {
        const foundRequest = await requestRepository.findById(requestId);
        if (!foundRequest) throw new AppError(404, "Resource: Request does not exist.");

        if (!foundRequest.fieldCleaner || foundRequest.fieldCleaner.id !== cleanerId) {
            throw new AppError(403, "Unauthorized: You cannot submit this request for review.");
        }

        if (foundRequest.overallStatus !== "in-progress") {
            throw new AppError(400, "Bad Request: Only requests in progress can be completed.");
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

            const targetSofa = foundRequest.sofas.find(s => s.sofaId === sofaId);

            if (!targetSofa) {
                throw new AppError(400, "Bad Request: Invalid sofa ID provided.");
            }

            const imageUrl = await imageService.uploadImage(file.buffer, fieldName, "sofa_cleaning_requests");

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
            const targetSofa = foundRequest.sofas.find(s => s.sofaId === sofaId);
            if (!targetSofa) {
                throw new AppError(400, "Bad Request: Provided health score for unknown Sofa ID.");
            }
            targetSofa.healthScore = score;
        }

        const oldStatus = foundRequest.overallStatus;
        foundRequest.overallStatus = "review";

        const reviewStatusEvent: IStatusEvent = {
            step: "review",
            label: "Pending Review",
            icon: "🔍",
            timestamp: new Date()
        };

        foundRequest.statusEvents.push(reviewStatusEvent);

        // Explicitly tell Mongoose the array was modified so it doesn't skip the save. as we mutating nestead property
        foundRequest.markModified("sofas");

        await foundRequest.save();

        await dashboardStatsService.recordStatusTransition(oldStatus, foundRequest.overallStatus); // Dashboard stats

        return foundRequest;

    }
}

export = new RequestService();