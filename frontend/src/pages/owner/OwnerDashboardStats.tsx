import { Row, Col, Card, Stack } from "react-bootstrap";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Legend } from "recharts";

interface OwnerDashboardStatsProps {
    orderRevenue: number;
    orderSofas: number;
    completed: number;
    recleanSofas: { name: string; value: number; fill: string }[];
    approved: { name: string; value: number; fill: string }[];
    statusOrders: { name: string; value: number; fill: string }[];
}

export const OwnerDashboardStats: React.FC<OwnerDashboardStatsProps> = ({
    orderRevenue,
    orderSofas,
    completed,
    recleanSofas,
    approved,
    statusOrders
}) => {

    return (
        <Stack gap={4} className="mt-3">
            <Row className="g-4">
                <Col lg={4}>
                    <Card className="h-100 bg-light">
                        <Card.Body className="p-3 p-md-4">
                            <Card.Text className="fw-bold mb-4 text-secondary fs-6">Averages and Rates</Card.Text>

                            <Stack gap={3}>
                                <Stack direction="horizontal" className="justify-content-between border p-2">
                                    <Card.Text className="mb-0 fw-medium">Average Revenue Per Order</Card.Text>
                                    <Card.Text className="mb-0 text-success fw-bold">₹{orderRevenue.toLocaleString()}</Card.Text>
                                </Stack>
                                <Stack direction="horizontal" className="justify-content-between border p-2">
                                    <Card.Text className="mb-0 fw-medium">Average Sofas Per Order</Card.Text>
                                    <Card.Text className="mb-0 fw-bold text-dark">{orderSofas}</Card.Text>
                                </Stack>
                                <Stack direction="horizontal" className="justify-content-between border p-2">
                                    <Card.Text className="mb-0 fw-medium">Order Completion Rate</Card.Text>
                                    <Card.Text className="mb-0 text-primary fw-bold">{completed}%</Card.Text>
                                </Stack>
                            </Stack>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sofa Quality Assurance */}
                <Col lg={4}>
                    <Card className="h-100 bg-light">
                        <Card.Body className="p-3 p-md-4">
                            <Card.Text className="fw-bold mb-3 text-secondary fs-6">Sofas</Card.Text>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={recleanSofas}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={80}
                                    />
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Approved and Rejected */}
                <Col lg={4}>
                    <Card className="h-100 bg-light">
                        <Card.Body className="p-3 p-md-4">
                            <Card.Text className="fw-bold mb-3 text-secondary fs-6">Orders</Card.Text>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={approved}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={80}
                                    />
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Pipeline Volume */}
            <Row>
                <Col lg={12}>
                    <Card className="bg-light">
                        <Card.Body className="p-3 p-md-4">
                            <Card.Text className="fw-bold mb-4 text-secondary fs-6">Order Status</Card.Text>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={statusOrders}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Stack>
    );
};