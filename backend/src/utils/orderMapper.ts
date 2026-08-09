import { type HydratedDocument } from "mongoose";
import { type IOrder } from "../types/order.interface";
import { type OrderResponseDTO } from "../dto/order.dto";

const mapOrderToDTO = (orderDocument: HydratedDocument<IOrder>): OrderResponseDTO => {
    const orderObject = orderDocument.toObject();

    return {
        id: orderObject._id.toString(),
        customer: orderObject.customer,
        customerAddress: orderObject.customerAddress,
        cleaningType: orderObject.cleaningType,
        orderStatus: orderObject.orderStatus,
        fieldCleaner: orderObject.fieldCleaner,
        manager: orderObject.manager,
        cleaningDate: orderObject.cleaningDate ? orderObject.cleaningDate.toISOString() : null,
        totalPrice: orderObject.totalPrice,
        statusEvents: orderObject.statusEvents.map((statusEvent) => ({
            ...statusEvent,
            timestamp: statusEvent.timestamp.toISOString()
        })),
        sofas: orderObject.sofas,
    }
}

export = mapOrderToDTO;