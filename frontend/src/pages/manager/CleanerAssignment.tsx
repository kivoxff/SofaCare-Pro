import { useState } from "react";
import { Row, Col, Stack, Form, Button, Card } from "react-bootstrap";
import type { IUser } from "../../types/user.types";
import type { IManagerOrder } from "../../types/sofaCleaningOrder.types";

interface CleanerAssignmentProps {
    orders: IManagerOrder[];
    cleaners: IUser[];
    submitAssign: (oid: string, cleaner: { id: string, fullName: string }, date: Date) => Promise<void>;
}

export const CleanerAssignment: React.FC<CleanerAssignmentProps> = ({ orders, cleaners, submitAssign }) => {
    const [forms, setForms] = useState<{ [oid: string]: { cid: string; date: string } }>({});
    const [loadingOid, setLoadingOid] = useState<string | null>(null);

    const handleSubmit = async (e: React.SubmitEvent, oid: string) => {
        e.preventDefault();
        setLoadingOid(oid);

        try {
            const date = forms[oid].date;
            const cid = forms[oid].cid;
            const cleaner = cleaners.find(c => c.id === cid);

            if (!cleaner || !date) return;

            await submitAssign(oid, { id: cleaner.id, fullName: cleaner.fullName }, new Date(date));
        } finally {
            setLoadingOid(null);
        }
    };

    return (
        orders.length === 0 ? (
            <span className="d-block mt-3 text-muted">No Orders.</span>
        ) : (
            <Stack gap={3}>
                {orders.map(o => (
                    <Card key={o.id} className="bg-light">
                        <Card.Body className="p-3 p-md-4">
                            <Form onSubmit={(e) => handleSubmit(e, o.id)}>
                                <Row className="align-items-center gy-2">
                                    <Col xs={12} md={5}>
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
                                    <Col xs={12} md={7}>
                                        <Stack direction="horizontal" gap={2} className="justify-content-end flex-wrap">
                                            <Form.Select
                                                required
                                                style={{ maxWidth: "220px" }}
                                                disabled={loadingOid === o.id}
                                                value={forms[o.id]?.cid || ""}
                                                onChange={(e) => setForms({
                                                    ...forms,
                                                    [o.id]: { ...forms[o.id], cid: e.target.value }
                                                })}
                                            >
                                                <option disabled value="">Select Cleaner...</option>
                                                {cleaners.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.fullName}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control
                                                required
                                                type="date"
                                                style={{ maxWidth: "160px" }}
                                                disabled={loadingOid === o.id}
                                                value={forms[o.id]?.date || ""}
                                                onChange={(e) => setForms({
                                                    ...forms,
                                                    [o.id]: { ...forms[o.id], date: e.target.value }
                                                })}
                                            />
                                            <Button
                                                type="submit"
                                                variant="primary"
                                                style={{ whiteSpace: 'nowrap' }}
                                                disabled={loadingOid === o.id}
                                            >
                                                {loadingOid === o.id ? "Loading..." : "Submit"}
                                            </Button>
                                            {/* <Button variant="primary" onClick={() => { }}>
                                            View Full Order Details
                                        </Button> */}
                                        </Stack>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                ))}
            </Stack>
        )
    );
};