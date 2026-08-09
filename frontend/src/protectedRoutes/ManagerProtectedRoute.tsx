import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { UserProtectedRoute } from "./UserProtectedRoute";

interface ManagerProtectedRouteProps {
    children: React.ReactNode;
}

export const ManagerProtectedRoute: React.FC<ManagerProtectedRouteProps> = ({
    children,
}) => {
    const { user } = useAppSelector((state) => state.user);

    return (
        <UserProtectedRoute>
            {user?.role === "Manager" ? (
                <>{children}</>
            ) : (
                <Navigate to="/" replace /> // unauthorized
            )}
        </UserProtectedRoute>
    )
};