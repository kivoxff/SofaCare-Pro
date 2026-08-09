import { Badge, Card, Stack, Spinner, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { ICustomerOrder } from "../../types/sofaCleaningOrder.types";

interface CustomerOrdersProps {
    orders: ICustomerOrder[];
    loading: boolean;
}

export const CustomerOrders = ({ orders, loading }: CustomerOrdersProps) => {
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
        <Card className="border-0">
            <Card.Body className="p-3 p-md-4">
                <Stack direction="horizontal" className="justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0 text-dark">Orders</h5>
                </Stack>

                <Stack gap={3}>
                    {loading ? (
                        <Stack className="align-items-center py-5">
                            <Spinner animation="border" variant="primary" />
                        </Stack>
                    ) : orders?.length === 0 ? (
                        <Card.Text className="text-center text-muted py-4">
                            No Orders. Create One Above!
                        </Card.Text>
                    ) : (
                        orders.map((o: ICustomerOrder) => {

                            return (
                                <Card key={o.id} className="bg-light">
                                    <Card.Body className="p-3 p-md-4">
                                        <Row className="align-items-center gy-2">
                                            <Col xs={12} md={4}>
                                                <Stack gap={1}>
                                                    <Card.Text className="mb-0 fw-bold text-secondary fs-6">
                                                        Order - {o.id} {/* We can show only the last 6 characters of the ID using slice().*/}
                                                    </Card.Text>
                                                    <Card.Text className="mb-0 text-muted small">
                                                        {o.cleaningType} - ₹{o.totalPrice}
                                                    </Card.Text>
                                                </Stack>
                                            </Col>
                                            <Col xs={12} md={8}>
                                                <Stack gap={2} direction="horizontal" className="justify-content-end flex-wrap">
                                                    <Badge
                                                        bg={getVariant(o.orderStatus)}
                                                        className="px-3 py-2 text-capitalize"
                                                    >
                                                        {o.orderStatus}
                                                    </Badge>

                                                    <Button variant="primary" onClick={() => navigate(`/sofa-cleaning-order/${o.id}`)}>
                                                        Order
                                                    </Button>
                                                </Stack>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                            )
                        })
                    )}
                </Stack>
            </Card.Body>
        </Card>
    );
};