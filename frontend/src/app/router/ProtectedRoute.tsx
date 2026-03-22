import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { isAdminRole } from "../../shared/auth/roleGuards";
import { useAuthSession } from "../../shared/auth/useAuthSession";

export default function ProtectedRoute() {
    const { isAuthenticated, isLoading, user, logout } = useAuthSession();
    const location = useLocation();
    const navigate = useNavigate();
    const kickedAdmin = useRef(false);

    useEffect(() => {
        if (
            isLoading ||
            !isAuthenticated ||
            !user ||
            !isAdminRole(user.role) ||
            kickedAdmin.current
        ) {
            return;
        }
        kickedAdmin.current = true;
        void (async () => {
            await logout();
            navigate("/login", {
                replace: true,
                state: {
                    authError:
                        "Tài khoản quản trị chỉ đăng nhập được tại cổng Admin. Vui lòng dùng ứng dụng quản trị.",
                },
            });
        })();
    }, [isLoading, isAuthenticated, user, logout, navigate]);

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

    if (user && isAdminRole(user.role)) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return <Outlet />;
}

