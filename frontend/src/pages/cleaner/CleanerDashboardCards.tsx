import { Card, Col, Row, Stack } from "react-bootstrap";

interface CleanerDashboardCardsProps {
    assignedCount: number;
    inProgressCount: number;
    recleanCount: number;
}

export const CleanerDashboardCards: React.FC<CleanerDashboardCardsProps> = ({ assignedCount, inProgressCount, recleanCount }) => {

    return (
        <Card className="border-0 mb-4">
            <Card.Body className="p-3 p-md-4">
                <h5 className="fw-bold mb-4 text-dark">Dashboard Statistics</h5>
                <Row className="g-3">
                    <Col xs={12} md={4}>
                        <Card className="border-success text-center h-100">
                            <Card.Body as={Stack} className="align-items-center justify-content-center py-4">
                                <h2 className="fw-bold text-success mb-1">{assignedCount}</h2>
                                <span className="text-muted fw-medium">Assinged</span>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} md={4}>
                        <Card className="border-primary text-center h-100">
                            <Card.Body as={Stack} className="align-items-center justify-content-center py-4">
                                <h2 className="fw-bold text-primary mb-1">{inProgressCount}</h2>
                                <span className="text-muted fw-medium">In Progress</span>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} md={4}>
                        <Card className="border-danger text-center h-100">
                            <Card.Body as={Stack} className="align-items-center justify-content-center py-4">
                                <h2 className="fw-bold text-danger mb-1">{recleanCount}</h2>
                                <span className="text-muted fw-medium">Reclean</span>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};
