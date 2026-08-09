import { type IOrder } from "../types/order.interface";
import orderModel = require("../models/order.model");
import type { HydratedDocument, QueryFilter } from "mongoose";

class OrderRepository {
    async create(orderData: IOrder): Promise<HydratedDocument<IOrder>> {
        const createdOrder: HydratedDocument<IOrder> = await orderModel.create(orderData);
        return createdOrder;
    }

    async findByFilters(filters: QueryFilter<IOrder>): Promise<HydratedDocument<IOrder>[]> {
        const filterdOrders = await orderModel
            .find(filters)
            .sort({ _id: -1 })
            // .populate("customerId", "fullName")
            // .populate("assignedTo", "fullName");

        return filterdOrders;
    }

    async findById(orderId: string): Promise<HydratedDocument<IOrder> | null> {
        const foundOrder = await orderModel
            .findById(orderId)
            // .populate("customerId", "fullName")
            // .populate("assignedTo", "fullName");

        return foundOrder;
    }
}

export = new OrderRepository();