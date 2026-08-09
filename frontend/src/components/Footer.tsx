import { Container, Row, Col, Stack } from "react-bootstrap";
import { Mail, MapPin, CodeSquareIcon } from "lucide-react";

const CLEANING_TYPES: Record<string, number> = {
    "Deep Cleaning": 1000,
    "Steam Cleaning": 1500,
    "Shampoo Cleaning": 1200,
    "Dry Cleaning": 1100,
    "Leather Cleaning & Conditioning": 2000,
};

export const Footer: React.FC = () => {

    return (
        <footer className="bg-light border-top mt-auto pt-5 pb-3">
            <Container>
                <Row className="gy-4 mb-4">

                    {/* Column 1: Brand & Description */}
                    <Col xs={12} md={5} lg={4}>
                        <h5 className="fw-bold text-primary mb-3">
                            SofaCare Pro
                        </h5>
                        <p className="text-muted small pe-lg-4">
                            Your trusted platform for professional sofa cleaning and care. We make it easier to keep your sofas clean, fresh, and looking their best.
                        </p>
                    </Col>

                    {/* Column 2: Cleaning Types */}
                    <Col xs={12} md={3} lg={4}>
                        <h5 className="fw-bold mb-3">Cleaning Types</h5>
                        <Stack gap={2}>
                            {Object.entries(CLEANING_TYPES).map(([t, _], i) => (
                                <small key={i} className="text-muted">
                                    ➤ {t}
                                </small>
                            ))}
                        </Stack>
                    </Col>

                    {/* Column 3: Contact & Socials */}
                    <Col xs={12} md={4} lg={4}>
                        <h5 className="fw-bold mb-3">Contact Info</h5>
                        <Stack gap={3}>

                            <Stack direction="horizontal" gap={2} className="align-items-start">
                                <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
                                <small className="text-muted">
                                    Maharashtra, India
                                </small>
                            </Stack>

                            <Stack direction="horizontal" gap={2} className="align-items-center">
                                <Mail size={18} className="text-primary flex-shrink-0" />
                                <a
                                    href="mailto:rohitthakare032@gmail.com"
                                    className="text-muted text-decoration-none small"
                                >
                                    rohitthakare032@gmail.com
                                </a>
                            </Stack>

                            <Stack direction="horizontal" gap={2} className="align-items-center">
                                <CodeSquareIcon size={18} className="text-primary flex-shrink-0" />
                                <a
                                    href="https://github.com/rohitxthakare"
                                    target="_blank"
                                    className="text-muted text-decoration-none small"
                                >
                                    GitHub Profile
                                </a>
                            </Stack>

                        </Stack>
                    </Col>
                </Row>

                <hr className="text-muted" />

                {/* Copyright Section */}
                <Stack direction="horizontal" className="justify-content-center pt-2">
                    <p className="text-muted small mb-0">
                        © {new Date().getFullYear()} SofaCare Pro. Student Project.
                    </p>
                </Stack>
            </Container>
        </footer>
    );
};