import React, { useState } from "react";
import { Button, Card, Col, Form, Modal, Row, Stack } from "react-bootstrap";
import { Plus } from "lucide-react";

const CLEANING_TYPES: Record<string, number> = {
    "Deep Cleaning": 1000,
    "Steam Cleaning": 1500,
    "Shampoo Cleaning": 1200,
    "Dry Cleaning": 1100,
    "Leather Cleaning & Conditioning": 2000,
};

interface CreateOrderModalProps {
    createOrder: (cleaningType: string, sofaCount: number, customerAddress: string) => Promise<void>;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({ createOrder }) => {
    const [show, setShow] = useState<boolean>(false);
    const [form, setForm] = useState<{ cleaningType: string; sofaCount: number; customerAddress: string; }>({
        cleaningType: "Deep Cleaning",
        sofaCount: 1,
        customerAddress: ""
    });

    const [_, setError] = useState<string | null>(null); // error
    const [loading, setLoading] = useState<boolean>(false);

    const total = CLEANING_TYPES[form.cleaningType] * form.sofaCount;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setForm((p) => ({
            ...p,
            [name]: name === "sofaCount" ? parseInt(value) || 1 : value
        }))
    }

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            await createOrder(form.cleaningType, form.sofaCount, form.customerAddress)
            setShow(false);
            setForm({
                cleaningType: "Deep Cleaning",
                sofaCount: 1,
                customerAddress: ""
            });
        } catch (err: any) {
            console.error("Failed to create order:", err);
            setError(err.response?.data?.message || err.message || "Failed to create order.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Create Order Trigger Card */}
            <Card className="border-0 mb-4">
                <Card.Body
                    as={Stack}
                    direction="horizontal"
                    className="justify-content-md-between justify-content-center align-items-center flex-wrap gap-3 p-3 p-md-4"
                >
                    <Stack>
                        <h5 className="fw-bold mb-1 text-dark text-center text-md-start">
                            Need a sofa cleaning?
                        </h5>
                        <p className="text-muted text-center text-md-start mb-0">
                            Create a new order for a sofa cleaning.
                        </p>
                    </Stack>

                    <Button
                        onClick={() => setShow(true)}
                        size="lg"
                        variant="primary"
                        className="d-flex align-items-center gap-2 px-4 shadow-sm"
                    >
                        <Plus size={20} className="bg-secondary rounded-circle shdown-lg" />
                        Create Order
                    </Button>
                </Card.Body>
            </Card>

            {/* Modal Content */}
            <Modal show={show} onHide={() => setShow(false)} centered size="lg" backdrop="static">
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title className="fw-bold">Create Cleaning Order</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Stack gap={4}>
                            {/* {error && (
                                <Alert variant="danger" className="mb-0">
                                    {error}
                                </Alert>
                            )} */}

                            <Card className="bg-light">
                                <Card.Body>
                                    <Card.Text className="fw-bold mb-1">Cleaning Details</Card.Text>
                                    <Card.Text className="text-muted mb-3">Fill the details below.</Card.Text>

                                    <Row className="g-3">
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Cleaning Type</Form.Label>
                                                <Form.Select name="cleaningType" value={form.cleaningType} onChange={handleChange} required>
                                                    <option value="" disabled>Select...</option>
                                                    {Object.entries(CLEANING_TYPES).map(([t, p]) => (
                                                        <option key={t} value={t}>
                                                            {`${t} - ₹${p}`}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Sofa Count</Form.Label>
                                                <Form.Control name="sofaCount" value={form.sofaCount} min={1} max={10} type="number" onChange={handleChange} required />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group>
                                        <Form.Label>Customer Address</Form.Label>
                                        <Form.Control as="textarea" rows={3} name="customerAddress" value={form.customerAddress} onChange={handleChange} placeholder="Enter full address" required />
                                    </Form.Group>
                                </Card.Body>
                            </Card>

                            <Card className="bg-light">
                                <Card.Body>
                                    <Card.Text className="fw-bold">Summary</Card.Text>

                                    <Stack gap={2}>
                                        <Stack direction="horizontal" className="justify-content-between">
                                            <span>Cleaning Type</span>
                                            <strong className="text-uppercase">{form.cleaningType}</strong>
                                        </Stack>

                                        <Stack direction="horizontal" className="justify-content-between">
                                            <span>Sofas</span>
                                            <strong>{form.sofaCount}</strong>
                                        </Stack>

                                        <hr />

                                        <Stack direction="horizontal" className="justify-content-between">
                                            <strong>Total Price</strong>
                                            <strong className="text-success fs-5">₹{total}</strong>
                                        </Stack>
                                    </Stack>
                                </Card.Body>
                            </Card>
                        </Stack>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button disabled={loading} type="submit" variant="primary">
                            {loading ? "Loading..." : "Create Order"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
};