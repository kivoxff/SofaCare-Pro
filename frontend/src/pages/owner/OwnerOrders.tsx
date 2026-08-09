import { Row, Col, Stack, Badge, Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { IOwnerOrder } from "../../types/sofaCleaningOrder.types";

interface OwnerOrdersProps {
    orders: IOwnerOrder[];
}

export const OwnerOrders: React.FC<OwnerOrdersProps> = ({ orders }) => {
    const navigate = useNavigate();

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
        orders.length === 0 ? (
            <Card.Text className="d-block mt-3 text-muted">No Orders</Card.Text>
        ) : (
            <Stack gap={3} className="mt-3">
                {orders.map(o => (
                    <Card key={o.id} className="bg-light">
                        <Card.Body className="p-3 p-md-4">
                            <Row className="align-items-center gy-2">
                                <Col xs={12} md={5}>
                                    <Stack gap={1}>
                                        <Card.Text className="mb-0 fw-bold text-secondary fs-6">
                                            Order - {o.id}
                                        </Card.Text>
                                        <Card.Text className="mb-0 text-muted">
                                            Customer: {o.customer?.fullName || "N/A"}
                                        </Card.Text>
                                        <Card.Text className="mb-0 text-muted">
                                            Service: {o.cleaningType || "Sofa Cleaning"}
                                        </Card.Text>
                                        <Card.Text className="mb-0 text-muted">
                                            Cleaner: {o.fieldCleaner?.fullName || "Unassigned"}
                                        </Card.Text>
                                        <Card.Text className="mb-0 text-muted">
                                            Price: ₹{o.totalPrice || 0}
                                        </Card.Text>
                                    </Stack>
                                </Col>

                                <Col xs={12} md={7}>
                                    <Stack gap={2} direction="horizontal" className="justify-content-end flex-wrap">
                                        <Badge
                                            bg={getVariant(o.orderStatus)}
                                            className="px-3 py-2 text-capitalize"
                                        >
                                            {o.orderStatus}
                                        </Badge>

                                        <Button
                                            variant="primary"
                                            onClick={() => navigate(`/sofa-cleaning-order/${o.id}`)}
                                        >
                                            Order
                                        </Button>
                                    </Stack>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}
            </Stack>
        )
    );
};