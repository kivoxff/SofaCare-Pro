import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { Spinner, Stack } from "react-bootstrap";

interface UserProtectedRouteProps {
    children: React.ReactNode;
}

export const UserProtectedRoute: React.FC<UserProtectedRouteProps> = ({ children }) => {
    const { user, isLoading } = useAppSelector((state) => state.user);

    return (
        isLoading ? (
            <Stack className="vh-100 justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="primary" />
            </Stack>
        ) : !user ? (
            <Navigate to="/" replace />
        ) : (
            <>{children}</>
        )
    )
};