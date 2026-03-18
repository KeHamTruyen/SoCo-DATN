import { ArrowRight, UserRound } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

export default function SignUp() {
    const navigate = useNavigate();
    const { register } = useAuthActions();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const fullName = String(formData.get("fullName") ?? "").trim();
        const email = String(formData.get("email") ?? "").trim();
        const username = String(formData.get("username") ?? "").trim();
        const password = String(formData.get("password") ?? "");
        const phone = String(formData.get("phone") ?? "").trim();

        void (async () => {
            setError(null);
            setIsSubmitting(true);
            try {
                const response = await register({
                    fullName,
                    email,
                    username,
                    password,
                    phone: phone || undefined,
                });
                sessionStorage.setItem("soco.tempToken", response.tempToken);
                sessionStorage.setItem("soco.pendingEmail", email);
                navigate("/verify-account");
            } catch (err) {
                const message =
                    err instanceof HttpError
                        ? err.message
                        : "Unable to sign up. Please try again.";
                setError(message);
            } finally {
                setIsSubmitting(false);
            }
        })();
    };

    return (
        <div className="w-full max-w-[540px]">
            <AuthCard
                title="Create an account"
                subtitle={
                    <>
                        When you sign up, you will start as a{" "}
                        <span className="font-semibold text-primary">
                            Buyer
                        </span>
                    </>
                }
                className="max-w-[540px]"
                footer={
                    <div className="space-y-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Already have an account?{" "}
                            <Link
                                className="font-semibold text-primary hover:underline"
                                to="/login"
                            >
                                Log in now
                            </Link>
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            By clicking Sign Up, you agree to our{" "}
                            <a
                                className="underline hover:text-slate-600"
                                href="#"
                            >
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                                className="underline hover:text-slate-600"
                                href="#"
                            >
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </div>
                }
            >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <SocialLoginButton provider="google" />
                    <SocialLoginButton provider="facebook" />
                </div>

                <AuthDivider />

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        id="fullName"
                        name="fullName"
                        type="text"
                        label="Full Name"
                        placeholder="John Doe"
                        leftIcon={<UserRound className="h-4 w-4" />}
                        maxLength={100}
                        required
                    />

                    <FormField
                        id="email"
                        name="email"
                        type="email"
                        label="Email Address"
                        placeholder="name@example.com"
                        required
                    />

                    <FormField
                        id="username"
                        name="username"
                        type="text"
                        label="Username"
                        placeholder="johndoe_99"
                        pattern="^[a-zA-Z0-9_]+$"
                        helperText="3-50 characters, letters, numbers, and underscores only"
                        required
                    />

                    <PasswordField
                        id="password"
                        name="password"
                        label="Password"
                        placeholder="••••••••"
                        minLength={8}
                        helperText="Min 8 characters, must include uppercase, lowercase, and a number"
                        required
                    />

                    <FormField
                        id="phone"
                        name="phone"
                        type="tel"
                        label="Phone (Optional)"
                        placeholder="1234567890"
                        helperText="10-15 digits"
                    />

                    <Button
                        type="submit"
                        size="lg"
                        className="mt-2 w-full"
                        disabled={isSubmitting}
                    >
                        <span>{isSubmitting ? "Creating..." : "Sign Up"}</span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    {error ? (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    ) : null}
                </form>
            </AuthCard>
        </div>
    );
}
