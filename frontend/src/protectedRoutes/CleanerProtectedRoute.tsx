import { Navigate } from "react-router-dom";
import { useAppSelector } from "../redux/hooks";
import { UserProtectedRoute } from "./UserProtectedRoute";

interface FieldCleanerProtectedRouteProps {
    children: React.ReactNode;
}

export const CleanerProtectedRoute: React.FC<FieldCleanerProtectedRouteProps> = ({
    children,
}) => {
    const { user } = useAppSelector((state) => state.user);

    return (
        <UserProtectedRoute>
            {user?.role === "Field_Cleaner" ? (
                <>{children}</>
            ) : (
                <Navigate to="/" replace /> // unauthorized
            )}
        </UserProtectedRoute>
    )
};