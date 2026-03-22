import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { HttpError } from "@/lib/httpClient";

export default function LoginPage() {
    const { token, login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);

    if (token) {
        return <Navigate to="/" replace />;
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setBusy(true);
        try {
            await login(email, password);
            navigate("/", { replace: true });
        } catch (err) {
            setError(
                err instanceof HttpError
                    ? err.message
                    : "Unable to sign in. Try again.",
            );
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-card-foreground shadow-sm">
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex items-center justify-center rounded-lg bg-primary p-2 text-primary-foreground">
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">
                            Admin sign in
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            SoCo administration portal
                        </p>
                    </div>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    {error ? (
                        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {error}
                        </p>
                    ) : null}
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Email
                        </label>
                        <input
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm text-foreground"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Password
                        </label>
                        <input
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm text-foreground"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
                    >
                        {busy ? "Signing in…" : "Sign in"}
                    </button>
                </form>
            </div>
        </div>
    );
}
