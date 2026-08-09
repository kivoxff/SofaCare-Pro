import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Container, Card, Tabs, Tab, Stack, Alert, Spinner } from "react-bootstrap";
import { ManagerDashboardCards } from "./ManagerDashboardCards";
import axiosClient from "../../services/axios";
import { useAppSelector } from "../../redux/hooks";

import { InReviewOrders } from "./InReviewOrders";
import { PendingOrders } from "./PendingOrders";
import { CompletedOrders } from "./CompletedOrders";
import { RoleAssignment } from "./RoleAssignment";
import { CleanerAssignment } from "./CleanerAssignment";
import type { IManagerOrder, ManagerOrdersResponse, ManagerStatusResponse } from "../../types/sofaCleaningOrder.types";
import type { IUser, UserResponse, UsersResponse } from "../../types/user.types";

export const ManagerDashboard: React.FC = () => {
    const { user } = useAppSelector((state) => state.user);

    const [orders, setOrders] = useState<IManagerOrder[]>([]);
    const [users, setUsers] = useState<IUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeKey, setActiveKey] = useState<string>("pending");

    useEffect(() => {
        const getDashboard = async () => {
            try {
                setError(null);

                // Fetch internal orders, customers, and field cleaners concurrently
                const response = await Promise.all([ // wait until every request completes
                    axiosClient.get<ManagerOrdersResponse>("/api/orders/internal"),
                    axiosClient.get<UsersResponse>("/api/users/role/Customer"),
                    axiosClient.get<UsersResponse>("/api/users/role/Field_Cleaner")
                ]);

                if (response[0].data.success) {
                    setOrders(response[0].data.data);
                }

                // Merge the two user lists safely
                let users: IUser[] = [];

                if (response[1].data.success) {
                    users = [...response[1].data.data];
                }

                if (response[2].data.success) {
                    users = [...users, ...response[2].data.data];
                }

                setUsers(users);

            } catch (err) {
                console.error("Failed to load manager dashboard data:", err);
                setError("Failed to load manager dashboard data.");
            } finally {
                setLoading(false);
            }
        };
        getDashboard();
    }, []);

    const pending = orders.filter(o => o.orderStatus === "pending");
    const approved = orders.filter(o => o.orderStatus === "approved");
    const inReview = orders.filter(o => o.orderStatus === "review");
    const completed = orders.filter(o => o.orderStatus === "review" || o.orderStatus === "completed");

    // Field cleaners are derived from the merged users list
    const cleaners = users.filter(u => u.role === "Field_Cleaner");

    const pendingCount = orders.filter(o => o.orderStatus === "pending").length || 0;
    const approvedCount = orders.filter(o => o.orderStatus === "approved").length || 0;
    const inReviewCount = orders.filter(o => o.orderStatus === "review").length || 0;

    // Core API Handlers
    const handleStatus = async (oid: string, status: "approve" | "reject" | "complete") => {
        try {
            const response = await axiosClient.patch<ManagerStatusResponse>(`/api/orders/${oid}/transition`, { transition: status });
            if (response.data.success) {
                setOrders(p => p.map(o => o.id === oid ? {
                    ...o,
                    orderStatus: status === "approve" ? "approved" : status === "reject" ? "rejected" : "completed"
                } : o));
            }
        } catch (err) {
            console.error("Failed to update order status:", err);
        }
    }

    const handleAssign = async (oid: string, cleaner: { id: string, fullName: string }, date: Date) => {

        try {
            const response = await axiosClient.patch<ManagerStatusResponse>(`/api/orders/${oid}/transition`,
                {
                    transition: "assign",
                    fieldCleaner: cleaner,
                    cleaningDate: date
                });
            if (response.data.success) {
                setOrders(p => p.map(o => o.id === oid ? {
                    ...o,
                    orderStatus: "assigned",
                } : o));
            }
        } catch (err) {
            console.error("Failed to assign cleaner:", err);
        }
    }

    const handleReclean = async (oid: string, recleanSofas: string[]) => {
        try {
            const response = await axiosClient.patch<ManagerStatusResponse>(`/api/orders/${oid}/transition`,
                {
                    transition: "reclean",
                    failedSofas: recleanSofas
                });
            if (response.data.success) {
                setOrders(p => p.map(o => o.id === oid ? {
                    ...o,
                    orderStatus: "reclean"
                } : o));
            }
        } catch (err) {
            console.error("Failed to submit order for reclean:", err);
        }
    }

    const handleRole = async (uid: string, role: "Customer" | "Field_Cleaner") => {
        try {
            await axiosClient.patch<UserResponse>(`/api/users/${uid}/role`, { role });
            setUsers(p => p.map(u => u.id === uid ? { ...u, role } : u));
        } catch (err) {
            console.error("Failed to update user role:", err);
        }
    };

    return (
        <Layout>
            <Container className="py-4 py-md-5">
                {/* Manager Welcome Message */}
                <Stack className="text-center mb-4 mb-md-5">
                    <h2 className="fw-bold mb-2">
                        Welcome back, {user?.fullName.split(" ")[0]} 👋
                    </h2>
                    <p className="text-muted mb-0 fs-6">
                        Approve orders, assign cleaners, review submissions, and manage user roles.
                    </p>
                </Stack>

                <ManagerDashboardCards pendingCount={pendingCount} approvedCount={approvedCount} inReviewCount={inReviewCount} />

                {loading ? (
                    <Stack className="align-items-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </Stack>
                ) : error ? (
                    <Alert variant="danger" className="mb-5 py-5 d-flex justify-content-center align-items-center">{error}</Alert>
                ) : (
                    <Card className="border-0">
                        <Card.Body className="p-3 p-md-4">
                            <Tabs activeKey={activeKey} onSelect={(k) => setActiveKey(k || "pending")} variant="pills" className="mb-4 fw-medium">

                                {/* PENDING APPROVALS */}
                                <Tab eventKey="pending" title={`Pending ${pending.length > 0 ? "•" : ""}`}>
                                    <PendingOrders orders={pending} submitStatus={handleStatus} />
                                </Tab>

                                {/* ASSIGNMENT DESK */}
                                <Tab eventKey="approved" title={`Assignment ${approved.length > 0 ? "•" : ""}`}>
                                    <CleanerAssignment orders={approved} cleaners={cleaners} submitAssign={handleAssign} />
                                </Tab>

                                {/* QA REVIEW */}
                                <Tab eventKey="review" title={`In Review ${inReview.length > 0 ? "•" : ""}`}>
                                    <InReviewOrders orders={inReview} submitReclean={handleReclean} submitAssign={handleAssign} submitStatus={handleStatus} />
                                </Tab>

                                {/* HISTORY */}
                                <Tab eventKey="completed" title="Completed">
                                    <CompletedOrders orders={completed} />
                                </Tab>

                                {/* ROLES */}
                                <Tab eventKey="role" title="Users">
                                    <RoleAssignment submitRole={handleRole} users={users} />
                                </Tab>

                            </Tabs>
                        </Card.Body>
                    </Card>
                )}
            </Container>
        </Layout>
    );
}