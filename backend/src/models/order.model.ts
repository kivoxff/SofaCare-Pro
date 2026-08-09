import mongoose = require("mongoose");
import { type Schema } from "mongoose";
import type { IStatusEvent, ISofaItem, IOrder } from "../types/order.interface";

const StatusEventsSchema: Schema = new mongoose.Schema<IStatusEvent>({
    step: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now }
}, { _id: false }); // Prevents Mongoose from automatically generate an '_id' field

const SofaItemSchema: Schema = new mongoose.Schema<ISofaItem>({
    sofaId: { type: String, required: true },
    status: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "completed", "reclean-required"]
    },
    healthScore: { type: Number, default: null },
    images: {
        before: { type: String, default: null },
        after: { type: String, default: null }
    }
}, { _id: false });

const CleaningOrderSchema: Schema = new mongoose.Schema<IOrder>({
    customer: {
        id: { type: String, required: true },
        fullName: { type: String, required: true }
    },
    customerAddress: { type: String, required: true },
    cleaningType: { type: String, required: true },
    orderStatus: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "approved", "rejected", "assigned", "in-progress", "review", "reclean", "completed"]
    },
    fieldCleaner: {
        id: { type: String, default: null },
        fullName: { type: String, default: null }
    },
    manager: {
        id: { type: String, default: null },
        fullName: { type: String, default: null }
    },
    cleaningDate: { type: Date, default: null },
    totalPrice: { type: Number, required: true },
    statusEvents: [StatusEventsSchema],
    sofas: [SofaItemSchema],
})

export = mongoose.model<IOrder>("CleaningOrder", CleaningOrderSchema);