import mongoose = require("mongoose");
import { type Schema } from "mongoose";
import { type IDashboardStats } from "../types/order.interface";

const DashboardStatsSchema: Schema = new mongoose.Schema<IDashboardStats>({
    _id: { type: String, default: "stats" }, // Hardcoded ID ensures a singleton
    orders: {
        totalOrders: { type: Number, default: 0 },
        pendingOrders: { type: Number, default: 0 },
        inProgressOrders: { type: Number, default: 0 },
        reviewOrders: { type: Number, default: 0 },
        recleanOrders: { type: Number, default: 0 },
        completedOrders: { type: Number, default: 0 },
    },
    revenue: {
        totalRevenue: { type: Number, default: 0 },
    },
    sofas: {
        totalSofasCleaned: { type: Number, default: 0 },
        recleanSofasCount: { type: Number, default: 0 },
    }
});

export = mongoose.model<IDashboardStats>("DashboardStat", DashboardStatsSchema);