import { useState, useEffect } from "react";
import { Row, Col, Stack, Form, Button, Modal, Card, Image } from "react-bootstrap";
import type { IManagerOrder } from "../../types/sofaCleaningOrder.types";

interface InReviewOrdersProps {
    orders: IManagerOrder[];
    submitStatus: (oid: string, status: "complete") => Promise<void>;
    submitAssign: (oid: string, cleaner: { id: string, fullName: string }, date: Date) => Promise<void>;
    submitReclean: (oid: string, recleanSofas: string[]) => Promise<void>
}

export const InReviewOrders: React.FC<InReviewOrdersProps> = ({ orders, submitReclean, submitAssign, submitStatus }) => {

    const [show, setShow] = useState<boolean>(false);
    const [activeOrder, setActiveOrder] = useState<IManagerOrder | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [status, setStatus] = useState<{ [sid: string]: string }>({});
    const [date, setDate] = useState<string>("");

    // Reset internal form state when modal opens
    useEffect(() => {
        if (show) {
            setStatus({});
            setDate("");
            setLoading(false);
        }
    }, [show]);

    // Open modal with existing order details
    const handleShow = (oid: string) => {
        const order = orders.find(o => o.id === oid);
        if (order) {
            setActiveOrder(order);
            setShow(true);
        }
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (!activeOrder) {
            return;
        }

        setLoading(true);

        try {
            const recleanSofas = Object.keys(status).filter(sid => status[sid] === "reclean");

            if (recleanSofas.length > 0) {
                await submitReclean(activeOrder.id, recleanSofas);
                await submitAssign(activeOrder.id, activeOrder.fieldCleaner, new Date(date));
            } else {
                await submitStatus(activeOrder.id, "complete");
            }
            setShow(false);
            setActiveOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const reclean = Object.values(status).includes("reclean");

    return (
        orders.length === 0 ? (
            <span className="d-block mt-3 text-muted">No Orders.</span>
        ) : (
            <Stack gap={3}>
                {/* QA REVIEW LIST TAB */}
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
                                            Cleaner: {o.fieldCleaner?.fullName}
                                        </Card.Text>
                                        <Card.Text className="mb-0 text-muted">
                                            Cleaning Type: {o.cleaningType}
                                        </Card.Text>
                                    </Stack>
                                </Col>
                                <Col xs={12} md={8}>
                                    <Stack gap={2} direction="horizontal" className="justify-content-end flex-wrap">
                                        <Button variant="primary" onClick={() => handleShow(o.id)}>
                                            Review
                                        </Button>
                                    </Stack>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                ))}

                {/* QA REVIEW INSPECTION MODAL */}
                {activeOrder && (
                    <Modal show={show} onHide={() => setShow(false)} centered size="lg" backdrop="static">
                        <Form onSubmit={handleSubmit}>
                            <Modal.Header closeButton>
                                <Modal.Title className="fw-bold text-break">
                                    Order Review - {activeOrder.id}
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <Stack gap={4}>
                                    <Card className="bg-light">
                                        <Card.Body>
                                            <Card.Text className="fw-bold mb-1">Order Details</Card.Text>
                                            <small className="text-muted d-block">
                                                Cleaner: {activeOrder.fieldCleaner?.fullName}
                                            </small>
                                            <small className="text-muted d-block">
                                                Date: {activeOrder.cleaningDate ? new Date(activeOrder.cleaningDate).toLocaleDateString() : 'N/A'}
                                            </small>
                                        </Card.Body>
                                    </Card>

                                    {activeOrder.sofas.map((s, i: number) => (
                                        <Card key={s.sofaId} className="bg-light">
                                            <Card.Body>
                                                <Row className="align-items-center gy-2 mb-4">
                                                    <Col xs={12} md={4}>
                                                        <div>
                                                            <h6 className="fw-bold mb-1">Sofa No. {i + 1}</h6>
                                                            <span className="text-muted fw-bold">Health Score: {s.healthScore}/10</span>
                                                        </div>
                                                    </Col>
                                                    <Col xs={12} md={8}>
                                                        <Stack gap={2} direction="horizontal" className="justify-content-end flex-wrap">
                                                            <Form.Group className="d-flex align-items-center gap-2 mb-0">
                                                                <Form.Label className="mb-0 fw-bold text-nowrap">Status:</Form.Label>
                                                                <Form.Select value={status[s.sofaId] || ""} onChange={(e) => setStatus({ ...status, [s.sofaId]: e.target.value })} required>
                                                                    <option value="" disabled>Select...</option>
                                                                    <option value="complete">Approve</option>
                                                                    <option value="reclean">Reclean</option>
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </Stack>
                                                    </Col>
                                                </Row>

                                                <Row className="g-3 text-center">
                                                    <Col md={6}>
                                                        {/* <Form.Label className="fw-bold d-block text-muted mb-2">Condition Before</Form.Label> */}
                                                        <Image src={s.images?.before} alt="Before" fluid className="mb-2" />
                                                        <Button onClick={() => window.open(s.images?.before, "_blank")}>Image Before</Button>
                                                    </Col>
                                                    <Col md={6}>
                                                        {/* <Form.Label className="fw-bold d-block text-muted mb-2">Condition After</Form.Label> */}
                                                        <Image src={s.images?.after} alt="After" fluid className="mb-2" />
                                                        <Button onClick={() => window.open(s.images?.after, "_blank")}>Image After</Button>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    ))}

                                    {reclean && (
                                        <Card className="bg-light">
                                            <Card.Body>
                                                <Card.Text className="fw-bold mb-2">Reschedule Reclean</Card.Text>
                                                <Card.Text className="mb-2">
                                                    Cleaner: {activeOrder.fieldCleaner?.fullName}
                                                </Card.Text>
                                                <Form.Group>
                                                    <Form.Label>Select the reclean date</Form.Label>
                                                    <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                                                </Form.Group>
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Stack>
                            </Modal.Body>

                            <Modal.Footer>
                                <Button variant="primary" type="submit" disabled={loading}>
                                    {loading ? "Loading..." : "Submit Review"}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>
                )}
            </Stack>
        )
    );
};