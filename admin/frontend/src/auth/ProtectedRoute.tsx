import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <p className="text-sm text-muted-foreground">Loading…</p>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
