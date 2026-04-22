import { Navigate } from "react-router-dom";
import { useAuthSession } from "../../shared/auth/useAuthSession";

export default function RootRedirect() {
    const { isAuthenticated, isLoading } = useAuthSession();

    if (isLoading) return null;

    return <Navigate to="/feed" replace />;
}
