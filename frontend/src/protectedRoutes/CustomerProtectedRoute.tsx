import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { UserProtectedRoute } from "./UserProtectedRoute";

interface CustomerProtectedRouteProps {
    children: React.ReactNode;
}

export const CustomerProtectedRoute: React.FC<CustomerProtectedRouteProps> = ({
    children,
}) => {
    const { user } = useAppSelector((state) => state.user);

    return (
        <UserProtectedRoute>
            {user?.role === "Customer" ? (
                <>{children}</>
            ) : (
                <Navigate to="/" replace /> // unauthorized
            )}
        </UserProtectedRoute>
    )
};