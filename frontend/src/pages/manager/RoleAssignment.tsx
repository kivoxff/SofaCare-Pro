import { Form, Stack, Card, Row, Col } from "react-bootstrap";
import type { IUser } from "../../types/user.types";

interface RoleAssignmentProps {
    users: IUser[];
    submitRole: (uid: string, role: "Customer" | "Field_Cleaner") => Promise<void>;
}

export const RoleAssignment: React.FC<RoleAssignmentProps> = ({ users, submitRole }) => {

    const handleChange = async (uid: string, value: string) => {
        if (value === "Customer" || value === "Field_Cleaner") {
            await submitRole(uid, value);
            // alert("Role Changed Successfully!");
        } else {
            console.error("Invalid role selected:", value);
        }
    }

    return (
        users.length === 0 ? (
            <span className="d-block mt-3 text-muted">No Users.</span>
        ) : (
            <Stack gap={3}>
                {users.map(u => (
                    <Card key={u.id} className="bg-light">
                        <Card.Body className="p-3 p-md-4">
                            <Row className="align-items-center gy-2">
                                <Col xs={12} md={5}>
                                    <Stack gap={1}>
                                        <Card.Text className="mb-0 fw-bold text-secondary fs-6 text-truncate">
                                            {u.fullName}
                                        </Card.Text>
                                        <Card.Text className="mb-0 text-muted">
                                            {u.email}
                                        </Card.Text>
                                    </Stack>
                                </Col>

                                <Col xs={12} md={7}>
                                    <Stack gap={2} direction="horizontal" className="justify-content-end flex-wrap">
                                        <Form.Select
                                            value={u.role || ""}
                                            onChange={(e) => handleChange(u.id, e.target.value)}
                                            style={{ width: '180px' }}
                                        >
                                            <option value="" disabled>Select...</option>
                                            <option value="Customer">Customer</option>
                                            <option value="Field_Cleaner">Field Cleaner</option>
                                        </Form.Select>
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