import { useEffect, useState } from "react";
import { Container, Button, Stack, Spinner, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import axiosClient from "../../services/axios";
import { Layout } from "../../components/Layout";
import type { GetOrderResponse, IOrder } from "../../types/sofaCleaningOrder.types";
import { OrderCard } from "./OrderCard";
import { OrderStatuses } from "./OrderStatuses";
import { OrderImages } from "./OrderImages";

export const OrderPage = () => {
    const { oid } = useParams<{ oid: string }>();
    const navigate = useNavigate();

    const [order, setOrder] = useState<IOrder | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getOrder = async () => {
            if (!oid) {
                return;
            };

            try {
                setLoading(true);
                setError(null);

                const response = await axiosClient.get<GetOrderResponse>(`/api/orders/${oid}`);

                if (response.data.success) {
                    setOrder(response.data.data);
                } else {
                    setError("Failed to load order.");
                }
            } catch (err) {
                console.error("Failed to load order:", err);
                setError("Failed to load order.");
            } finally {
                setLoading(false);
            }
        };

        getOrder();
    }, [oid]);

    return (
        <Layout>
            <Container className="py-4 py-md-5">

                {/* BACK BUTTON & HEADER */}
                <Stack direction="horizontal" gap={3} className="flex-wrap justify-content-between align-items-center mb-4">
                    <Button variant="primary" onClick={() => navigate(-1)}>
                        &larr; Back to Dashboard
                    </Button>
                    <h4 className="m-0 fw-bold text-break"> Order - {oid}</h4>
                </Stack>

                {/* LOADING STATE */}
                {loading && (
                    <Stack className="align-items-center p-5">
                        <Spinner animation="border" variant="primary" />
                        <span className="mt-3 text-muted">Loading...</span>
                    </Stack>
                )}

                {/* ERROR STATE */}
                {!loading && error && (
                    <Alert variant="danger" className="mb-5 py-5 d-flex justify-content-center align-items-center">
                        {error}
                    </Alert>
                )}

                {/* CONTENT */}
                {!loading && !error && order && (
                    <Stack gap={4}>
                        <OrderCard order={order} />

                        <OrderStatuses statuses={order.statusEvents || []} />

                        <OrderImages sofas={order.sofas || []} />
                    </Stack>
                )}
            </Container>
        </Layout>
    );
}