import { Outlet } from "react-router-dom";

/** Minimal shell: no site header or footer (checkout success, seller onboarding). */
export default function BareLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Outlet />
        </div>
    );
}
