import { Card, Row, Col, Stack, Image } from "react-bootstrap";
import type { ISofa } from "../../types/sofaCleaningOrder.types";

interface OrderImagesProps {
    sofas: ISofa[];
}

export const OrderImages: React.FC<OrderImagesProps> = ({ sofas }) => {

    const images = sofas.some(s => s.images?.before || s.images?.after);

    return (
        <Card className="border-0 mb-4">
            <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Before & After Images</h5>

                {!images ? (
                    <Card className="bg-light text-center py-5">
                        <Card.Text className="text-muted mb-0">
                            No images have been uploaded for this order yet.
                        </Card.Text>
                    </Card>
                ) : (
                    <Stack gap={4}>
                        {sofas.map((s, i) => (
                            <Card key={i} className="bg-light">
                                <Stack direction="horizontal" className="p-3 pb-0 justify-content-between align-items-center">
                                    <Card.Text className="fs-5 fw-bold mb-0">Sofa No. {i + 1}</Card.Text>
                                    {s.healthScore && (
                                        <Card.Text className="fw-bold mb-0 text-muted">
                                            Health Score: {s.healthScore}/10
                                        </Card.Text>
                                    )}
                                </Stack>

                                <Card.Body>
                                    <Row className="g-3 text-center">
                                        <Col xs={12} md={6}>
                                            <span className="fw-bold d-block text-muted mb-2">Condition Before</span>
                                            {s.images?.before ? (
                                                <Image src={s.images.before} alt="Before" fluid />
                                            ) : (
                                                <div className="py-5 text-muted bg-white">Image pending</div>
                                            )}
                                        </Col>

                                        <Col xs={12} md={6}>
                                            <span className="fw-bold d-block text-muted mb-2">Condition After</span>
                                            {s.images?.after ? (
                                                <Image src={s.images.after} alt="After" fluid />
                                            ) : (
                                                <div className="py-5 text-muted bg-white">Image pending</div>
                                            )}
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Card.Body>
        </Card>
    );
};