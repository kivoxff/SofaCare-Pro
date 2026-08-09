import React, { useState } from "react";
import { Row, Col, Stack, Button, Modal, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import type { ICleanerOrder } from "../../types/sofaCleaningOrder.types";

interface AssignedOrdersProps {
    orders: ICleanerOrder[];
    recleanOrder: (order: ICleanerOrder) => boolean;
    beginOrder: (oid: string) => Promise<void>;
}

export const AssignedOrders: React.FC<AssignedOrdersProps> = ({ orders, recleanOrder, beginOrder }) => {
    const navigate = useNavigate();

    const [activeOrder, setActiveOrder] = useState<ICleanerOrder | null>(null);
    const [show, setShow] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleShow = (order: ICleanerOrder) => {
        setActiveOrder(order);
        setShow(true);
    };

    const handleConfirmBegin = async () => {
        if (!activeOrder) return;
        setLoading(true);
        try {
            await beginOrder(activeOrder.id);
            setShow(false);
            setActiveOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const reclean = activeOrder ? recleanOrder(activeOrder) : false;

    return (
        orders.length === 0 ? (
            <span className="d-block mt-3 text-muted">No Orders.</span>
        ) : (
            <>
                <Stack gap={3}>
                    {orders.map((o) => {
                        const reclean = recleanOrder(o);
                        return (
                            <Card key={o.id} className="bg-light">
                                <Card.Body className="p-3 p-md-4">
                                    <Row className="align-items-center gy-2">
                                        <Col xs={12} md={4}>
                                            <Stack gap={1}>
                                                <Card.Text className={`mb-0 fw-bold fs-6 ${reclean ? 'text-danger' : 'text-secondary'}`}>
                                                    {reclean ? 'Reclean - ' : 'Order - '} {o.id}
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
                                                    <Button
                                                        variant={reclean ? "danger" : "success"}
                                                        className={!reclean ? "text-white" : ""}
                                                        onClick={() => handleShow(o)}
                                                    > Begin Order
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        );
                    })}
                </Stack>

                {/* Confirmation Modal */}
                <Modal show={show} onHide={() => setShow(false)} centered backdrop="static">
                    <Modal.Header closeButton>
                        <Modal.Title>Confirm Begin Order</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="bg-light p-4">
                        <Card.Text className="mb-2 fs-5 text-dark">
                            Are you sure you want to start {reclean ? 'Reclean' : 'Order'} - {activeOrder?.id}?
                        </Card.Text>
                        <Card.Text className="mb-0 text-muted">
                            Make sure you have arrived at the location before starting the order.
                        </Card.Text>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            variant={reclean ? "danger" : "success"}
                            className={!reclean ? "text-white" : ""}
                            onClick={handleConfirmBegin}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Confirm Begin"}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </>
        )
    );
};