import { useState } from "react";
import { Row, Col, Stack, Button, Modal, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { IManagerOrder } from "../../types/sofaCleaningOrder.types";

interface PendingOrdersProps {
    orders: IManagerOrder[];
    submitStatus: (oid: string, status: "approve" | "reject") => Promise<void>;
}

export const PendingOrders: React.FC<PendingOrdersProps> = ({ orders, submitStatus }) => {
    const navigate = useNavigate();

    const [show, setShow] = useState<boolean>(false);
    const [activeOrder, setActiveOrder] = useState<{ oid: string, status: "approve" | "reject" } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleShow = (oid: string, status: "approve" | "reject") => {
        setActiveOrder({ oid, status });
        setShow(true);
    };

    const handleConfirmStatus = async () => {
        if (activeOrder) {
            setLoading(true);
            try {
                await submitStatus(activeOrder.oid, activeOrder.status);
                setShow(false);
                setActiveOrder(null);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        orders.length === 0 ? (
            <span className="d-block mt-3 text-muted">No Orders.</span>
        ) : (
            <>
                <Stack gap={3}>
                    {orders.map(o => (
                        <Card key={o.id} className="bg-light">
                            <Card.Body className="p-3 p-md-4">
                                <Row className="align-items-center gy-2">
                                    <Col xs={12} md={4}>
                                        <Stack gap={1}>
                                            <Card.Text className="mb-0 fw-bold text-secondary fs-6">
                                                Order - {o.id}
                                            </Card.Text>
                                            <Card.Text className="mb-0 text-muted">
                                                Customer: {o.customer?.fullName}
                                            </Card.Text>
                                            <Card.Text className="mb-0 text-muted">
                                                Cleaning Type: {o.cleaningType}
                                            </Card.Text>
                                        </Stack>
                                    </Col>
                                    <Col xs={12} md={8}>
                                        <Stack gap={2} direction="horizontal" className="justify-content-end flex-wrap">
                                            <Button variant="primary" onClick={() => navigate(`/sofa-cleaning-order/${o.id}`)}>
                                                Order
                                            </Button>
                                            <Stack direction="horizontal" gap={2}>
                                                <Button variant="danger" onClick={() => handleShow(o.id, "reject")}>
                                                    Reject
                                                </Button>
                                                <Button variant="success" onClick={() => handleShow(o.id, "approve")}>
                                                    Approve
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                </Stack>

                {/* Confirmation Modal */}
                <Modal show={show} onHide={() => setShow(false)} centered backdrop="static">
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm {activeOrder?.status === "approve" ? "Approval" : "Rejection"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-light p-4">
                        <Card.Text className="mb-0 fs-5 text-dark">
                            Are you sure you want to {activeOrder?.status} Order - {activeOrder?.oid}?
                        </Card.Text>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant={activeOrder?.status === "approve" ? "success" : "danger"}
                            onClick={handleConfirmStatus}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : `Confirm ${activeOrder?.status === "approve" ? "Approve" : "Reject"}`}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    );
};