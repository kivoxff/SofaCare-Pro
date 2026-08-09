import { Card, Stack } from "react-bootstrap";
import type { IStatus } from "../../types/sofaCleaningOrder.types";

interface OrderStatusesProps {
    statuses: IStatus[];
}

export const OrderStatuses: React.FC<OrderStatusesProps> = ({ statuses }) => {

    return (
        <Card className="border-0 mb-4">
            <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Order Statuses</h5>

                <Stack gap={2} className="align-items-center">
                    {statuses.map((s: IStatus, i: number) => (
                        <Stack key={i} className="align-items-center w-100">
                            <Card
                                className="w-100 border bg-light"
                                style={{ maxWidth: "500px" }}
                            >
                                <Card.Body className="py-2 px-3">
                                    <Stack
                                        direction="horizontal"
                                        className="justify-content-between align-items-center flex-wrap gap-2"
                                    >
                                        <strong className="text-dark">
                                            {s.icon} {s.label}
                                        </strong>

                                        <small className="text-muted">
                                            {new Date(s.timestamp).toLocaleDateString()}
                                        </small>
                                    </Stack>
                                </Card.Body>
                            </Card>

                            {i !== statuses.length - 1 && ( // checking current element index with last element index
                                <p className="text-muted fw-bold fs-5 my-1">↓</p>
                            )}
                        </Stack>
                    ))}
                </Stack>
            </Card.Body>
        </Card>
    );
};