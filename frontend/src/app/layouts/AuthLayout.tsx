import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <div className="relative min-h-screen bg-background-light font-display text-slate-900 dark:bg-background-dark dark:text-slate-100">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute right-[-10%] top-[-12%] h-[320px] w-[320px] rounded-full bg-primary/20 blur-[100px] sm:h-[420px] sm:w-[420px]" />
                <div className="absolute bottom-[-12%] left-[-8%] h-[260px] w-[260px] rounded-full bg-primary/10 blur-[90px] sm:h-[340px] sm:w-[340px]" />
            </div>

            <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    );
}
