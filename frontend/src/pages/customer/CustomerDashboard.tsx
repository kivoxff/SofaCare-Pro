import React, { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Container, Stack } from "react-bootstrap";
import { useAppSelector } from "../../redux/hooks";
import axiosClient from "../../services/axios";
import { CustomerDashboardCards } from "./CustomerDashboardCards";
import type { CreateOrderResponse, CustomerOrdersResponse, ICustomerOrder } from "../../types/sofaCleaningOrder.types";
import { CreateOrderModal } from "./CreateOrderModal";
import { CustomerOrders } from "./CustomerOrders";

export const CustomerDashboard: React.FC = () => {
    const [orders, setOrders] = useState<ICustomerOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const { user } = useAppSelector((state) => state.user);

    useEffect(() => {
        const getOrders = async () => {
            try {
                const response = await axiosClient.get<CustomerOrdersResponse>("/api/orders/customer");
                if (response.data.success) {
                    setOrders(response.data.data);
                }
            } catch (err) {
                console.error("Failed to load customer orders:", err);
            } finally {
                setLoading(false);
            }
        }

        getOrders();
    }, [])

    const pendingCount = orders.filter(o => o.orderStatus === "pending").length || 0;
    const inProgressCount = orders.filter(o => ["assigned", "in-progress", "approved", "reclean"].includes(o.orderStatus)).length || 0;
    const completedCount = orders.filter(o => ["completed", "review"].includes(o.orderStatus)).length || 0;

    // Manual state update trick (Avoids re-fetching entire list!)
    const handleCreate = async (cleaningType: string, sofaCount: number, customerAddress: string) => {
        try {
            const response = await axiosClient.post<CreateOrderResponse>("/api/orders", {
                cleaningType,
                sofaCount,
                customerAddress
            });
            if (response.data.success) {
                setOrders((p) => [response.data.data, ...p]); // Trigger list refresh // Here we have one extra property: sofaCount
            }
        } catch (err) {
            console.error("Failed to create order:", err);
        }
    };

    return (
        <Layout>
            <Container className="py-4 py-md-5">
                {/* Welcome */}
                <Stack className="text-center mb-4 mb-md-5">
                    <h2 className="fw-bold mb-2">
                        Welcome back, {user?.fullName.split(" ")[0]} 👋
                    </h2>
                    <p className="text-muted mb-0 fs-6">
                        Manage your sofa cleaning orders and track their progress.
                    </p>
                </Stack>

                {/* Create Order Card + Modal */}
                <CreateOrderModal createOrder={handleCreate} />

                {/* Statistics */}
                <CustomerDashboardCards pendingCount={pendingCount} inProgressCount={inProgressCount} completedCount={completedCount} />

                {/* Recent Orders */}
                <CustomerOrders orders={orders} loading={loading} />
            </Container>
        </Layout>
    );
};