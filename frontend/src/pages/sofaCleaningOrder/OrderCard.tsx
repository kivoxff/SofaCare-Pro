import { Card, Row, Col, Badge, Stack } from "react-bootstrap";
import type { IOrder } from "../../types/sofaCleaningOrder.types";

interface OrderCardProps {
    order: IOrder;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {

    const getVariant = (status: string) => {
        const s = status.toLowerCase();

        if (s === "pending") {
            return "warning";
        } else if (s === "assigned" || s === "in-progress") {
            return "primary";
        } else if (s === "review") {
            return "info";
        } else if (s === "completed") {
            return "success";
        } else if (s === "rejected" || s === "reclean") {
            return "danger";
        } else {
            return "secondary";
        }
    };

    return (
        <Card className="border-0 mb-4">
            <Card.Body className="p-4">
                <Stack direction="horizontal" className="justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Info</h5>
                    <Badge bg={getVariant(order.orderStatus)} className="px-3 py-2 text-capitalize">
                        {order.orderStatus}
                    </Badge>
                </Stack>

                <Stack direction="horizontal" gap={4} className="flex-wrap align-items-center">
                    <Col xs={12} lg={6}>
                        <Stack gap={2}>
                            <Row>
                                <Col xs={5} md={4} className="text-muted fw-bold">Customer:</Col>
                                <Col xs={7} md={8}>{order.customer.fullName}</Col>
                            </Row>
                            <Row>
                                <Col xs={5} md={4} className="text-muted fw-bold">Address:</Col>
                                <Col xs={7} md={8}>{order.customerAddress || "Address not provided"}</Col>
                            </Row>
                            <Row>
                                <Col xs={5} md={4} className="text-muted fw-bold">Cleaning Type:</Col>
                                <Col xs={7} md={8}>{order.cleaningType} ({order.sofas?.length || 0} sofas)</Col>
                            </Row>
                            {order.fieldCleaner?.fullName && (
                                <Row>
                                    <Col xs={5} md={4} className="text-muted fw-bold">Cleaner:</Col>
                                    <Col xs={7} md={8}>{order.fieldCleaner.fullName}</Col>
                                </Row>
                            )}
                            {order.manager?.fullName && (
                                <Row>
                                    <Col xs={5} md={4} className="text-muted fw-bold">Manager:</Col>
                                    <Col xs={7} md={8}>{order.manager.fullName}</Col>
                                </Row>
                            )}

                            {order.cleaningDate && (
                                <Row>
                                    <Col xs={5} md={4} className="text-muted fw-bold">Cleaning Date:</Col>
                                    <Col xs={7} md={8}>
                                        {new Date(order.cleaningDate).toLocaleDateString()}
                                    </Col>
                                </Row>
                            )}
                        </Stack>
                    </Col>

                    <Col className="p-2 text-center mt-3 mt-lg-0 bg-light border">
                        <Stack gap={1}>
                            <Stack className="text-muted fw-bold text-uppercase small">Total Price</Stack>
                            <Stack className="fs-2 fw-bold text-success">
                                ₹{order.totalPrice}
                            </Stack>
                        </Stack>
                    </Col>
                </Stack>
            </Card.Body>
        </Card>
    );
};