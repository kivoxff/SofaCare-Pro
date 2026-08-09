import { useState, useEffect } from "react";
import { Container, Tabs, Tab, Spinner, Alert, Stack, Card } from "react-bootstrap";
import { Layout } from "../../components/Layout";
import axiosClient from "../../services/axios";

import { OwnerDashboardCards } from "./OwnerDashboardCards";
import { OwnerDashboardStats } from "./OwnerDashboardStats";
import { OwnerOrders } from "./OwnerOrders";
import { RoleAssignment } from "./RoleAssignment";
import { useAppSelector } from "../../redux/hooks";
import type { IUser, UsersResponse } from "../../types/user.types";
import type { IOwnerOrder, OwnerOrdersResponse } from "../../types/sofaCleaningOrder.types";
import type { StatsResponse, IStats } from "../../types/stats.types";

export const OwnerDashboard = () => {
    const [stats, setStats] = useState<IStats | null>(null);
    const [orders, setOrders] = useState<IOwnerOrder[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [activeKey, setActiveKey] = useState<string>("stats");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const { user } = useAppSelector((state) => state.user);

    useEffect(() => {
        const getDashboard = async () => {
            try {
                setLoading(true);

                const response = await Promise.all([
                    axiosClient.get<StatsResponse>("/api/orders/dashboardStats"),
                    axiosClient.get<OwnerOrdersResponse>("/api/orders/internal"),
                    axiosClient.get<UsersResponse>("/api/users/role/Customer"),
                    axiosClient.get<UsersResponse>("/api/users/role/Field_Cleaner"),
                    axiosClient.get<UsersResponse>("/api/users/role/Manager"),
                ]);

                // Set stats
                if (response[0].data.success) {
                    setStats(response[0].data.data);
                }

                // Set orders
                if (response[1].data.success) {
                    setOrders(response[1].data.data);
                }

                // Merge the two user lists safely
                let users: any = [];

                if (response[2].data.success) {
                    users = [...users, ...response[2].data.data]
                }

                if (response[3].data.success) {
                    users = [...users, ...response[3].data.data]
                }

                if (response[4].data.success) {
                    users = [...users, ...response[4].data.data]
                }

                setUsers(users);

            } catch (err) {
                console.error("Failed to load owner dashboard data:", err);
                setError("Failed to load owner dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        getDashboard();
    }, []);

    const handleRole = async (uid: string, role: "Customer" | "Field_Cleaner" | "Manager") => {
        try {
            await axiosClient.patch<UsersResponse>(`/api/users/${uid}/role`, { role });
            setUsers(p => p.map(u => u.id === uid ? { ...u, role } : u));
        } catch (err) {
            console.error("Failed to update user role:", err);
        }
    };

    const orderRevenue = stats?.orders.totalOrders ? Math.ceil((stats?.revenue.totalRevenue ? stats?.revenue.totalRevenue : 0) / (stats?.orders.completedOrders ? stats?.orders.completedOrders : 1)) : 0; // avgRevenuePerOrder
    const orderSofas = stats?.orders.totalOrders ? Math.ceil((stats?.sofas.totalSofasCleaned ? stats?.sofas.totalSofasCleaned : 0) / (stats?.orders.completedOrders ? stats?.orders.completedOrders : 1)) : 0; // avgSofasPerOrder

    const reclean = stats?.sofas.totalSofasCleaned ? Math.ceil(((stats?.sofas.recleanSofasCount ? stats?.sofas.recleanSofasCount : 0) / (stats?.sofas.totalSofasCleaned ? stats?.sofas.totalSofasCleaned : 1)) * 100) : 0; // recleanRate
    const completed = stats?.orders.totalOrders ? Math.ceil(((stats?.orders.completedOrders ? stats?.orders.completedOrders : 0) / (stats?.orders.totalOrders ? stats?.orders.totalOrders : 1)) * 100) : 0; // complitionRate

    let approvedCount = 0;
    let rejectedCount = 0;

    orders.forEach(o => {
        if (o.orderStatus !== "pending") {
            if (o.orderStatus === "rejected") {
                rejectedCount++;
            } else {
                approvedCount++;
            }
        }
    });

    const approved = [ // approvalData
        { name: "Approved", value: approvedCount, fill: "#198754" }, // success for approved,
        { name: "Rejected", value: rejectedCount, fill: "#dc3545" }  // danger for rejected
    ];

    const recleanSofas = [ // qualityData
        {
            name: "Passed First Time",
            value: (stats?.sofas.totalSofasCleaned ? stats?.sofas.totalSofasCleaned : 0) - (stats?.sofas.recleanSofasCount ? stats?.sofas.recleanSofasCount : 0),
            fill: "#198754" // success for pass
        },
        {
            name: "Required Reclean",
            value: stats?.sofas.recleanSofasCount ? stats?.sofas.recleanSofasCount : 0,
            fill: "#dc3545" // danger for reclean 
        }
    ];

    const statusOrders = [ // pipelineData
        { name: "Pending", value: stats?.orders.pendingOrders ? stats?.orders.pendingOrders : 0, fill: "#ffc107" }, // warning
        { name: "In Progress", value: stats?.orders.inProgressOrders ? stats?.orders.inProgressOrders : 0, fill: "#0d6efd" }, // primary
        { name: "completed", value: stats?.orders.completedOrders ? stats?.orders.completedOrders : 0, fill: "#198754" }, // success
        {
            name: "Reclean",
            value: orders.filter((o) => {
                const statuses = o.statusEvents.filter((s: any) => s.step === "assigned");
                if (statuses.length === 0) return false;
                return statuses[statuses.length - 1].label.includes("Reclean");
            }).length,
            fill: "#dc3545" // danger
        },
    ];

    return (
        <Layout>
            <Container className="py-4 py-md-5">
                {/* Welcome Header */}
                <Stack className="text-center mb-4 mb-md-5">
                    <h2 className="fw-bold mb-2">
                        Welcome back, {user?.fullName.split(" ")[0]} 👋
                    </h2>
                    <p className="text-muted mb-0 fs-6">
                        View dashboard statistics, review all orders, and manage user roles.
                    </p>
                </Stack>

                {/* TOP EXECUTIVE KPI ROW */}
                <OwnerDashboardCards stats={stats} reclean={reclean} />

                {loading ? (
                    <Stack className="align-items-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </Stack>
                ) : error ? (
                    <Alert variant="danger" className="mb-5 py-5 d-flex justify-content-center align-items-center">
                        {error}
                    </Alert>
                ) : (
                    <Card className="border-0">
                        <Card.Body className="p-3 p-md-4">
                            <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k || "stats")} variant="pills" className="mb-4 fw-medium">

                                {/* BUSINESS INSIGHTS */}
                                <Tab eventKey="stats" title="Stats">
                                    <OwnerDashboardStats
                                        orderRevenue={orderRevenue}
                                        orderSofas={orderSofas}
                                        completed={completed}
                                        recleanSofas={recleanSofas}
                                        approved={approved}
                                        statusOrders={statusOrders}
                                    />
                                </Tab>

                                {/* SYSTEM ORDERS */}
                                <Tab eventKey="orders" title="Orders">
                                    <OwnerOrders orders={orders} />
                                </Tab>

                                {/* ACCESS CONTROL */}
                                <Tab eventKey="role" title="Users">
                                    <RoleAssignment users={users} submitRole={handleRole} />
                                </Tab>

                            </Tabs>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </Layout>
    );
}
