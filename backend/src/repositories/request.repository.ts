import { type ICleaningRequest } from "../types/request.interface";
import requestModel = require("../models/request.model");
import type { HydratedDocument, QueryFilter } from "mongoose";

class RequestRepository {
    async create(requestData: ICleaningRequest): Promise<HydratedDocument<ICleaningRequest>> {
        const createdRequest: HydratedDocument<ICleaningRequest> = await requestModel.create(requestData);
        return createdRequest;
    }

    async findByFilters(filters: QueryFilter<ICleaningRequest>): Promise<HydratedDocument<ICleaningRequest>[]> {
        const filterdRequests = await requestModel
            .find(filters)
            .sort({ _id: -1 })
            // .populate("customerId", "fullName")
            // .populate("assignedTo", "fullName");

        return filterdRequests;
    }

    async findById(requestId: string): Promise<HydratedDocument<ICleaningRequest> | null> {
        const foundRequest = await requestModel
            .findById(requestId)
            // .populate("customerId", "fullName")
            // .populate("assignedTo", "fullName");

        return foundRequest;
    }
}

export = new RequestRepository();