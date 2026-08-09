import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Container, Card, Tabs, Tab, Stack, Spinner, Alert } from "react-bootstrap";
import axiosClient from "../../services/axios";
import { useAppSelector } from "../../redux/hooks";
import { CleanerDashboardCards } from "./CleanerDashboardCards";
import { AssignedOrders } from "./AssignedOrders";
import { InProgressOrders } from "./InProgressOrders";
import { CompletedOrders } from "./CompletedOrders";
import type { CleanerStatusResponse, CleanerOrdersResponse, ICleanerOrder } from "../../types/sofaCleaningOrder.types";

export const CleanerDashboard: React.FC = () => {
    const { user } = useAppSelector((state) => state.user);

    const [orders, setOrders] = useState<ICleanerOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeKey, setActiveKey] = useState<string>("assigned");

    useEffect(() => {
        const getOrders = async () => {
            try {
                const response = await axiosClient.get<CleanerOrdersResponse>("/api/orders/internal");
                if (response.data.success) {
                    setOrders(response.data.data);
                }
            } catch (err) {
                console.error("Failed to load orders:", err);
                setError("Failed to load orders.");
            } finally {
                setLoading(false);
            }
        };
        getOrders();
    }, []);

    const recleanOrder = (order: ICleanerOrder) => {
        const statuses = order.statusEvents.filter((s) => s.step === "assigned");
        if (statuses.length === 0) return false;
        return statuses[statuses.length - 1].label.includes("Reclean");
    };

    const handleBegin = async (oid: string) => {
        try {
            const response = await axiosClient.patch<CleanerStatusResponse>(`/api/orders/${oid}/transition`, { transition: "start" });
            if (response.data.success) {
                setOrders(p => p.map(o => o.id === oid ? {
                    ...o,
                    orderStatus: "in-progress"
                } : o));
            }
        } catch (err) {
            console.error("Failed to begin order:", err);
        }
    };

    const handleSubmit = async (oid: string, data: FormData) => {
        try {
            const response = await axiosClient.patch<CleanerStatusResponse>(`/api/orders/${oid}/completion`, data); // No need of: { headers: { "Content-Type": "multipart/form-data" }}
            if (response.data.success) {
                setOrders(p => p.map(o => o.id === oid ? {
                    ...o,
                    orderStatus: "review"
                } : o));
            }
        } catch (err) {
            console.error("Failed to submit order:", err);
        }
    };

    const assigned = orders.filter(o => o.orderStatus === "assigned");
    const inProgress = orders.filter(o => o.orderStatus === "in-progress");
    const completed = orders.filter(o => o.orderStatus === "review" || o.orderStatus === "completed");

    const assignedCount = orders.filter(o => o.orderStatus === "assigned").length || 0;
    const inProgressCount = orders.filter(o => o.orderStatus === "in-progress").length || 0;
    const recleanCount = orders.filter(o =>
        (o.orderStatus === "assigned" || o.orderStatus === "in-progress") && recleanOrder(o)
    ).length || 0;

    return (
        <Layout>
            <Container className="py-4 py-md-5">
                {/* Cleaner Welcome Message */}
                <Stack className="text-center mb-4 mb-md-5">
                    <h2 className="fw-bold mb-2">
                        Welcome back, {user?.fullName.split(" ")[0]} 👋
                    </h2>
                    <p className="text-muted mb-0 fs-6">
                        Begin assigned orders, submit completed orders, and view past orders.
                    </p>
                </Stack>

                <CleanerDashboardCards assignedCount={assignedCount} inProgressCount={inProgressCount} recleanCount={recleanCount} />

                {loading ? (
                    <Stack className="align-items-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </Stack>
                ) : error ? (
                    <Alert variant="danger" className="mb-5 py-5 d-flex justify-content-center align-items-center">{error}</Alert>
                ) : (
                    <Card className="border-0">
                        <Card.Body className="p-3 p-md-4">
                            <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k || "assigned")} variant="pills" className="mb-4 fw-medium">

                                <Tab eventKey="assigned" title={`Assigned ${assigned.length > 0 ? "•" : ""}`}>
                                    <AssignedOrders orders={assigned} recleanOrder={recleanOrder} beginOrder={handleBegin} />
                                </Tab>

                                <Tab eventKey="in-progress" title={`In Progress ${inProgress.length > 0 ? "•" : ""}`}>
                                    <InProgressOrders orders={inProgress} recleanOrder={recleanOrder} submitOrder={handleSubmit} />
                                </Tab>

                                <Tab eventKey="completed" title="Completed">
                                    <CompletedOrders orders={completed} />
                                </Tab>

                            </Tabs>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </Layout>
    );
}