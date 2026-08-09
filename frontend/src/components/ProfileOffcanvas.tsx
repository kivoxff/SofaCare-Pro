import { LogOut, Mail, SquareUserRound } from "lucide-react";
import { Badge, Button, Card, Image, Offcanvas, Stack } from "react-bootstrap";
import type { IUser } from "../types/user.types";
import { useNavigate, type NavigateFunction } from "react-router-dom";

interface ProfileOffcanvasProps {
    show: boolean;
    onHide: () => void;
    user: IUser | null;
    logout: () => void;
}

export const ProfileOffcanvas = ({ show, onHide, user, logout }: ProfileOffcanvasProps) => {

    const navigate: NavigateFunction = useNavigate();

    return (
        <Offcanvas
            show={show}
            onHide={onHide}
            placement="end"
            className="border-start-0"
        >

            <Offcanvas.Header closeButton className="border-bottom px-4 py-3">
                <Offcanvas.Title className="fw-bold">
                    My Profile
                </Offcanvas.Title>
            </Offcanvas.Header>

            <Offcanvas.Body className="p-4">
                {!user ? (
                    <Stack gap={1}>
                        <h5 className="fw-bold mb-0 text-center">
                            No User Found
                        </h5>

                        <small className="text-muted text-center">
                            You're not currently signed in.
                        </small>

                        <small className="text-muted text-center">
                            Please log in to view your profile.
                        </small>

                        <Button
                            onClick={() => navigate("/")}
                            className="mt-3"
                        >
                            Login Here
                        </Button>
                    </Stack>
                ) : (
                    <>
                        <Stack gap={3} className="align-items-center mb-4">
                            <Image
                                src={user.profileImage}
                                roundedCircle
                                width={120}
                                height={120}
                                className="border p-1"
                                alt="Profile Image"
                            />
                            <Badge
                                bg={
                                    user.role === "Customer" ? "primary"
                                        : user.role === "Field_Cleaner" ? "secondary"
                                            : user.role === "Manager" ? "warning" : "success"}
                                text={user.role === "Manager" ? "dark" : "light"}
                                className="px-3 py-2 fw-bold fs-6">
                                {user.role === "Field_Cleaner" ? "Field Cleaner" : user.role}
                            </Badge>
                        </Stack>

                        <Card className="bg-light">
                            <Card.Body as={Stack} gap={4} className="p-4">
                                <Stack direction="horizontal" gap={3}>
                                    <div className="bg-white p-2 rounded-circle">
                                        <SquareUserRound size={20} className="text-primary" />
                                    </div>
                                    <Stack>
                                        <small className="text-muted fw-semibold">
                                            Full Name
                                        </small>
                                        <strong className="fs-6">
                                            {user.fullName}
                                        </strong>
                                    </Stack>
                                </Stack>

                                <Stack direction="horizontal" gap={3}>
                                    <div className="bg-white p-2 rounded-circle">
                                        <Mail size={20} className="text-primary" />
                                    </div>
                                    <Stack>
                                        <small className="text-muted fw-semibold">
                                            Email
                                        </small>
                                        <strong className="fs-6">
                                            {user.email}
                                        </strong>
                                    </Stack>
                                </Stack>
                            </Card.Body>
                        </Card>

                        <Button
                            onClick={logout}
                            variant="danger"
                            className="d-flex align-items-center justify-content-center gap-2 w-100 mt-4 py-2"
                        >
                            <LogOut size={18} />
                            Logout
                        </Button>
                    </>
                )}
            </Offcanvas.Body>

        </Offcanvas >
    )
}