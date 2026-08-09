import { SquareUserRound } from "lucide-react";
import { useState } from "react";
import { Button, Navbar, Stack } from "react-bootstrap";
import { ProfileOffcanvas } from "./ProfileOffcanvas";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { logoutUser } from "../redux/userThunk";
import { useNavigate } from "react-router-dom";

export const Navigation: React.FC = () => {
    const [show, setShow] = useState<boolean>(false);

    const { user } = useAppSelector((state) => state.user);

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const handleProfileHide = () => {
        setShow(false);
    }

    const handleUserLogout = () => {
        dispatch(logoutUser());
        navigate("/");
    }

    return (
        <>
            {/* Navbar */}
            <Navbar bg="white" className="shadow-sm px-3 px-md-4 py-3 sticky-top">
                <Navbar.Brand className="fw-bold fs-4 text-primary m-0">
                    SofaCare Pro
                </Navbar.Brand>

                <Stack direction="horizontal" gap={2} className="ms-auto">
                    <Button
                        variant="light"
                        className="d-flex align-items-center gap-2 fw-medium px-3"
                        onClick={() => setShow(true)}
                    >
                        <SquareUserRound size={20} className="text-primary" />
                        Profile
                    </Button>
                </Stack>
            </Navbar>

            {/* Profile Offcanvas */}
            <ProfileOffcanvas show={show} onHide={handleProfileHide} logout={handleUserLogout} user={user} />
        </>
    )
};