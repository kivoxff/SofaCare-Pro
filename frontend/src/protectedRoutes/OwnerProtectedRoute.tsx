import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { UserProtectedRoute } from "./UserProtectedRoute";

interface OwnerProtectedRouteProps {
    children: React.ReactNode;
}

export const OwnerProtectedRoute: React.FC<OwnerProtectedRouteProps> = ({
    children,
}) => {
    const { user } = useAppSelector((state) => state.user);

    return (
        <UserProtectedRoute>
            {user?.role === "Owner" ? (
                <>{children}</>
            ) : (
                <Navigate to="/" replace /> // unauthorized
            )}
        </UserProtectedRoute>
    );
};