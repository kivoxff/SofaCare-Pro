import { Card, Col, Row, Stack } from "react-bootstrap";

interface ManagerDashboardCardsProps {
    pendingCount: number;
    approvedCount: number;
    inReviewCount: number;
}

export const ManagerDashboardCards: React.FC<ManagerDashboardCardsProps> = ({ pendingCount, approvedCount, inReviewCount }) => {

    return (
        <Card className="border-0 mb-4">
            <Card.Body className="p-3 p-md-4">
                <h5 className="fw-bold mb-4 text-dark">Dashboard Statistics</h5>
                <Row className="g-3">
                    <Col xs={12} md={4}>
                        <Card className="border-success text-center h-100">
                            <Card.Body as={Stack} className="align-items-center justify-content-center py-4">
                                <h2 className="fw-bold text-success mb-1">{pendingCount}</h2>
                                <span className="text-muted fw-medium">Pending</span>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} md={4}>
                        <Card className="border-primary text-center h-100">
                            <Card.Body as={Stack} className="align-items-center justify-content-center py-4">
                                <h2 className="fw-bold text-primary mb-1">{approvedCount}</h2>
                                <span className="text-muted fw-medium">Needs Assignment</span>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col xs={12} md={4}>
                        <Card className="border-warning text-center h-100">
                            <Card.Body as={Stack} className="align-items-center justify-content-center py-4">
                                <h2 className="fw-bold text-warning mb-1">{inReviewCount}</h2>
                                <span className="text-muted fw-medium">In Review</span>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};
