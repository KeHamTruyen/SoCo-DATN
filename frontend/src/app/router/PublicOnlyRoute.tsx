import { Navigate, Outlet } from "react-router-dom";
import { useAuthSession } from "../../shared/auth/useAuthSession";

export default function PublicOnlyRoute() {
    const { isAuthenticated, isLoading } = useAuthSession();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/feed" replace />;
    }

    return <Outlet />;
}

