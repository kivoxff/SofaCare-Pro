import React, { useState, useEffect, type ChangeEvent } from "react";
import { Row, Col, Stack, Form, Button, Modal, Card, Badge, Image } from "react-bootstrap";
import { Upload } from "lucide-react";
import type { ICleanerOrder } from "../../types/sofaCleaningOrder.types";

interface InProgressOrdersProps {
    orders: ICleanerOrder[];
    recleanOrder: (order: ICleanerOrder) => boolean;
    submitOrder: (oid: string, data: FormData) => Promise<void>;
}

export const InProgressOrders: React.FC<InProgressOrdersProps> = ({ orders, recleanOrder, submitOrder }) => {
    const [activeOrder, setActiveOrder] = useState<ICleanerOrder | null>(null);
    const [show, setshow] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const [health, setHealth] = useState<Record<string, Record<string, string>>>({});
    const [beforeImages, setBeforeImages] = useState<Record<string, File>>({});
    const [afterImages, setAfterImages] = useState<Record<string, File>>({});
    const [imageUrls, setImageUrls] = useState<{ before: Record<string, string>, after: Record<string, string> }>({ before: {}, after: {} });

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        if (!show) {
            Object.values(imageUrls.before).forEach(u => URL.revokeObjectURL(u));
            Object.values(imageUrls.after).forEach(u => URL.revokeObjectURL(u));
            setImageUrls({ before: {}, after: {} });
        }
    }, [show]);

    const handleShow = (order: ICleanerOrder) => {
        setActiveOrder(order);
        setHealth({});
        setBeforeImages({});
        setAfterImages({});
        setshow(true);
    };

    const handleImage = (sid: string, type: "before" | "after", files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        const url = URL.createObjectURL(file);

        if (type === "before") {
            setBeforeImages(p => ({ ...p, [sid]: file }));
            setImageUrls(p => ({ ...p, before: { ...p.before, [sid]: url } }));
        } else {
            setAfterImages(p => ({ ...p, [sid]: file }));
            setImageUrls(p => ({ ...p, after: { ...p.after, [sid]: url } }));
        }
    };

    const handleHealth = (sid: string, name: string, value: string) => {
        setHealth(p => ({
            ...p,
            [sid]: { ...(p[sid] || {}), [name]: value }
        }));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!activeOrder) return;

        const pendingSofas = activeOrder.sofas.filter((s) => s.status !== 'completed');
        const scores: Record<string, number> = {};

        for (const sofa of pendingSofas) {
            const name = health[sofa.sofaId];
            const score = Math.max(1, parseInt(name.dirt) + parseInt(name.stain) + parseInt(name.odor) + parseInt(name.tear));
            scores[sofa.sofaId] = score;
        }

        const data = new FormData();
        data.append("healthScores", JSON.stringify(scores));
        Object.entries(beforeImages).forEach(([sid, file]) => data.append(`before_${sid}`, file));
        Object.entries(afterImages).forEach(([sid, file]) => data.append(`after_${sid}`, file));

        setLoading(true);
        try {
            await submitOrder(activeOrder.id, data);
            setshow(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        orders.length === 0 ? (
            <span className="d-block mt-3 text-muted">No Orders.</span>
        ) : (
            <Stack gap={3}>
                {
                    orders.map((o) => {
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
                                                {/* <Button variant="outline-dark" onClick={() => navigate(`/sofa-cleaning-order/${o.id}`)}>
                                                    View Details
                                                </Button> */}
                                                <Button
                                                    variant="primary"
                                                    onClick={() => handleShow(o)}
                                                >
                                                    <Upload size={16} className="me-1 pb-1" /> Submit
                                                </Button>
                                            </Stack>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        );
                    })
                }

                {/*  SUBMIT COMPLETION MODAL */}
                <Modal show={show} onHide={() => setshow(false)} centered size="lg" backdrop="static">
                    {
                        activeOrder && (
                            <Form onSubmit={handleSubmit}>
                                <Modal.Header closeButton>
                                    <Modal.Title className="fw-bold text-break">
                                        Order Completion - {activeOrder.id}
                                    </Modal.Title>
                                </Modal.Header>

                                <Modal.Body>
                                    <Stack gap={4}>
                                        {activeOrder.sofas?.map((s, i) => {
                                            const completed = s.status === 'completed';
                                            const failed = s.status === 'reclean-required';
                                            const reclean = recleanOrder(activeOrder);

                                            const names = health[s.sofaId];
                                            let score = null;
                                            if (names && names.dirt && names.stain && names.odor && names.tear) {
                                                score = Math.max(1, parseInt(names.dirt) + parseInt(names.stain) + parseInt(names.odor) + parseInt(names.tear));
                                            }

                                            if (completed && reclean) {
                                                return (
                                                    <Card key={i} className="bg-light text-success">
                                                        <Card.Body className="py-2 px-3 fw-bold d-flex align-items-center">
                                                            Sofa No. {i + 1} was approved.
                                                        </Card.Body>
                                                    </Card>
                                                );
                                            }

                                            return (
                                                <Card key={i} className="bg-light">
                                                    <Card.Body>
                                                        <Stack direction="horizontal" className="justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                                            <Card.Text className="fw-bold">
                                                                Sofa No. {i + 1}
                                                                {failed && <Badge bg="danger" className="ms-3 px-3 py-2 text-capitalize">Reclean</Badge>}
                                                            </Card.Text>
                                                            {score !== null && (
                                                                <span className="fw-bold text-secondary">
                                                                    Sofa Health: {score}/10
                                                                </span>
                                                            )}
                                                        </Stack>

                                                        <Row className="g-3 mb-3">
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>Before Image</Form.Label>
                                                                    <Form.Control
                                                                        type="file"
                                                                        accept="image/*"
                                                                        required
                                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleImage(s.sofaId, "before", e.target.files)}
                                                                    />
                                                                    {imageUrls.before[s.sofaId] && (
                                                                        <Image
                                                                            src={imageUrls.before[s.sofaId]}
                                                                            alt="Before Preview"
                                                                            fluid
                                                                            className="mt-2"
                                                                        />
                                                                    )}
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>After Image</Form.Label>
                                                                    <Form.Control
                                                                        type="file"
                                                                        accept="image/*"
                                                                        required
                                                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleImage(s.sofaId, "after", e.target.files)}
                                                                    />
                                                                    {imageUrls.after[s.sofaId] && (
                                                                        <Image
                                                                            src={imageUrls.after[s.sofaId]}
                                                                            alt="After Preview"
                                                                            fluid
                                                                            className="mt-2"
                                                                        />
                                                                    )}
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>

                                                        <Card.Text className="fw-bold mb-3">Sofa Health Details</Card.Text>

                                                        <Row className="g-3">
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>Dirt</Form.Label>
                                                                    <Form.Select required value={health[s.sofaId]?.dirt || ""} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleHealth(s.sofaId, 'dirt', e.target.value)}>
                                                                        <option value="" disabled>Select...</option>
                                                                        <option value="3">Score 3</option>
                                                                        <option value="2">Score 2</option>
                                                                        <option value="1">Score 1</option>
                                                                        <option value="0">Score 0</option>
                                                                    </Form.Select>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>Stain</Form.Label>
                                                                    <Form.Select required value={health[s.sofaId]?.stain || ""} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleHealth(s.sofaId, 'stain', e.target.value)}>
                                                                        <option value="" disabled>Select...</option>
                                                                        <option value="3">Score 3</option>
                                                                        <option value="2">Score 2</option>
                                                                        <option value="1">Score 1</option>
                                                                        <option value="0">Score 0</option>
                                                                    </Form.Select>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>Odor</Form.Label>
                                                                    <Form.Select required value={health[s.sofaId]?.odor || ""} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleHealth(s.sofaId, 'odor', e.target.value)}>
                                                                        <option value="" disabled>Select...</option>
                                                                        <option value="2">Score 2</option>
                                                                        <option value="1">Score 1</option>
                                                                        <option value="0">Score 0</option>
                                                                    </Form.Select>
                                                                </Form.Group>
                                                            </Col>
                                                            <Col md={6}>
                                                                <Form.Group>
                                                                    <Form.Label>Tear</Form.Label>
                                                                    <Form.Select required value={health[s.sofaId]?.tear || ""} onChange={(e: ChangeEvent<HTMLSelectElement>) => handleHealth(s.sofaId, 'tear', e.target.value)}>
                                                                        <option value="" disabled>Select...</option>
                                                                        <option value="2">Score 2</option>
                                                                        <option value="1">Score 1</option>
                                                                        <option value="0">Score 0</option>
                                                                    </Form.Select>
                                                                </Form.Group>
                                                            </Col>
                                                        </Row>
                                                    </Card.Body>
                                                </Card>
                                            );
                                        })}
                                    </Stack>
                                </Modal.Body>

                                <Modal.Footer className="bg-white d-flex justify-content-end flex-wrap gap-2">
                                    <Stack direction="horizontal" gap={2}>
                                        <Button variant="primary" type="submit" disabled={loading}>
                                            {loading ? "Loading..." : "Submit"}
                                        </Button>
                                    </Stack>
                                </Modal.Footer>
                            </Form>
                        )
                    }
                </Modal>
            </Stack>
        )
    );
};