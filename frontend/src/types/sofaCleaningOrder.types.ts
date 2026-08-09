export interface ISofa {
    sofaId: string;
    status: "pending" | "completed" | "reclean-required";
    healthScore: number | null;
    images: {
        before: string | null;
        after: string | null;
    };
}

export interface IStatus {
    step: "pending" | "approved" | "rejected" | "assigned" | "in-progress" | "review" | "reclean" | "completed";
    label: string;
    icon: string;
    timestamp: string; // ISO Date string;
}

export interface IOrder {
    id: string;
    customer: {
        id: string;
        fullName: string;
    };
    customerAddress: string;
    cleaningType: string;
    orderStatus: "pending" | "approved" | "rejected" | "assigned" | "in-progress" | "review" | "reclean" | "completed";
    fieldCleaner: {
        id: string | null;
        fullName: string | null;
    };
    manager: {
        id: string | null;
        fullName: string | null;
    };
    cleaningDate: string | null; // ISO Date string
    totalPrice: number;
    statusEvents: IStatus[];
    sofas: ISofa[]
}

export interface GetOrderResponse {
    success: boolean;
    message: string;
    data: IOrder
}

export interface CreateOrderResponse {
    success: boolean;
    message: string;
    data: {
        id: string;
        cleaningType: string;
        orderStatus: "pending";
        totalPrice: number;
        sofaCount: number;
    };
}

export interface ICustomerOrder {
    id: string;
    cleaningType: string;
    orderStatus: "pending" | "approved" | "rejected" | "assigned" | "in-progress" | "review" | "reclean" | "completed";
    totalPrice: number;
}

export interface CustomerOrdersResponse {
    success: boolean;
    message: string;
    data: ICustomerOrder[]
}

export interface ICleanerOrder {
    id: string;
    customer: {
        id: string;
        fullName: string;
    };
    cleaningType: string;
    orderStatus: "assigned" | "in-progress" | "review" | "completed";
    statusEvents: {
        step: "assigned" | "in-progress" | "review" | "completed";
        label: string;
        icon: string;
        timestamp: string; // ISO Date string;
    }[]
    sofas: ISofa[]
}

export interface CleanerOrdersResponse {
    success: boolean;
    message: string;
    data: ICleanerOrder[]
}

export interface CleanerStatusResponse {
    success: boolean;
    message: string;
    data: ICleanerOrder
}

export interface IManagerOrder {
    id: string;
    customer: {
        id: string;
        fullName: string;
    };
    cleaningType: string;
    orderStatus: "pending" | "approved" | "rejected" | "assigned" | "review" | "reclean" | "completed";
    fieldCleaner: {
        id: string
        fullName: string
    };
    cleaningDate: string;
    sofas: {
        sofaId: string;
        status: "pending" | "completed" | "reclean-required";
        healthScore: number;
        images: {
            before: string;
            after: string;
        };
    }[]
}

export interface ManagerOrdersResponse {
    success: boolean;
    message: string;
    data: IManagerOrder[]
}

export interface ManagerStatusResponse {
    success: boolean;
    message: string;
    data: IManagerOrder
}

export interface IOwnerOrder {
    id: string;
    customer: {
        id: string;
        fullName: string;
    };
    cleaningType: string;
    orderStatus: "pending" | "approved" | "rejected" | "assigned" | "in-progress" | "review" | "reclean" | "completed";
    fieldCleaner: {
        id: string | null;
        fullName: string | null;
    };
    totalPrice: number;
    statusEvents: IStatus[];
}

export interface OwnerOrdersResponse {
    success: boolean;
    message: string;
    data: IOwnerOrder[]
}