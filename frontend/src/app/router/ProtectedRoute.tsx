import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthSession } from "../../shared/auth/useAuthSession";

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuthSession();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return <Outlet />;
}
