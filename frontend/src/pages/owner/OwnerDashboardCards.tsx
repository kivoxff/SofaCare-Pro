import { Card, Col, Row, Stack } from "react-bootstrap";
import type { IStats } from "../../types/stats.types";

interface OwnerDashboardCardsProps {
    stats: IStats | null
    reclean: number;
}

export const OwnerDashboardCards: React.FC<OwnerDashboardCardsProps> = ({ stats, reclean }) => {
    return (
        <Card className="border-0 mb-4">
            <Card.Body className="p-3 p-md-4">
                <Card.Title as="h5" className="fw-bold mb-4 text-dark">Dashboard Statistics</Card.Title>
                <Row className="g-3">
                    <Col xs={12} md={4}>
                        <Card className="border-success text-center h-100">
                            <Card.Body as={Stack} className="align-items-center justify-content-center py-4">
                                <h2 className="fw-bold text-success mb-1">₹{stats?.revenue.totalRevenue.toLocaleString() || 0}</h2>
                                <Card.Text className="text-muted fw-medium mb-0">Revenue</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} md={4}>
                        <Card className="border-primary text-center h-100">
                            <Card.Body as={Stack} className="align-items-center justify-content-center py-4">
                                <h2 className="fw-bold text-primary mb-1">{stats?.orders.totalOrders || 0}</h2>
                                <Card.Text className="text-muted fw-medium mb-0">Orders</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} md={4}>
                        <Card className="border-danger text-center h-100">
                            <Card.Body as={Stack} className="align-items-center justify-content-center py-4">
                                <h2 className="fw-bold text-danger mb-1">{reclean}%</h2>
                                <Card.Text className="text-muted fw-medium mb-0">Reclean</Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};