import { ArrowRight, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthActions } from "../features/auth/hooks/useAuthActions";
import { HttpError } from "../shared/api/httpClient";
import {
    AuthCard,
    AuthDivider,
    Button,
    FormField,
    PasswordField,
    SocialLoginButton,
} from "../shared/ui";

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, completeLogin } = useAuthActions();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const msg = (location.state as { authError?: string } | null)
            ?.authError;
        if (msg) {
            setError(msg);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.pathname, location.state, navigate]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const email = String(formData.get("email") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        void (async () => {
            setError(null);
            setIsSubmitting(true);
            try {
                const response = await login({ email, password });
                if (response.requires2FA) {
                    sessionStorage.setItem(
                        "soco.tempToken",
                        response.accessToken,
                    );
                    navigate("/verify");
                    return;
                }
                completeLogin(response);
                navigate("/feed");
            } catch (err) {
                if (err instanceof HttpError && err.status === 403) {
                    const details = err.details as {
                        data?: { email?: string; tempToken?: string };
                    } | null;
                    const tempToken = details?.data?.tempToken;
                    if (tempToken) {
                        const verifyEmail = details?.data?.email ?? email;
                        sessionStorage.setItem(
                            "soco.pendingEmail",
                            verifyEmail,
                        );
                        sessionStorage.setItem("soco.tempToken", tempToken);
                        navigate("/verify-account");
                        return;
                    }
                }
                const message =
                    err instanceof HttpError
                        ? err.message
                        : "Unable to login. Please try again.";
                setError(message);
            } finally {
                setIsSubmitting(false);
            }
        })();
    };

    return (
        <div className="w-full max-w-md">
            <AuthCard
                title="Welcome back"
                subtitle="Enter your details to access your shop"
                footer={
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Don't have an account?{" "}
                            <Link
                                className="font-semibold text-primary hover:underline"
                                to="/signup"
                            >
                                Sign up
                            </Link>
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                            By logging in, you agree to our{" "}
                            <a
                                className="underline hover:text-primary"
                                href="#"
                            >
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                                className="underline hover:text-primary"
                                href="#"
                            >
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </div>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormField
                        id="email"
                        name="email"
                        type="text"
                        label="Email or Username"
                        placeholder="Email or username"
                        leftIcon={<UserRound className="h-4 w-4" />}
                        required
                    />

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Password
                            </span>
                            <Link
                                className="text-xs font-semibold text-primary hover:underline"
                                to="/forgot-password"
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <PasswordField
                            id="password"
                            name="password"
                            label=""
                            placeholder="••••••••"
                            required
                            containerClassName="space-y-0"
                        />
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        <span>{isSubmitting ? "Logging in..." : "Login"}</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    {error ? (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    ) : null}
                </form>

                <AuthDivider />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SocialLoginButton provider="google" />
                    <SocialLoginButton provider="facebook" />
                </div>
            </AuthCard>
        </div>
    );
}
