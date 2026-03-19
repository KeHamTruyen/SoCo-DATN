import { ArrowLeft, ArrowRight, Mail, Shield, Verified } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthActions } from "../features/auth/hooks/useAuthActions";
import { HttpError } from "../shared/api/httpClient";
import { AuthCard, Button, FormField } from "../shared/ui";

export default function ForgotPassword() {
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { forgotPassword } = useAuthActions();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const email = String(formData.get("email") ?? "").trim();

        void (async () => {
            setIsSuccess(false);
            setError(null);
            setIsSubmitting(true);
            try {
                await forgotPassword(email);
                setIsSuccess(true);
            } catch (err) {
                const message =
                    err instanceof HttpError
                        ? err.message
                        : "Unable to send recovery link. Please try again.";
                setError(message);
            } finally {
                setIsSubmitting(false);
            }
        })();
    };

    return (
        <div className="w-full max-w-md">
            <AuthCard
                title="Forgot Password"
                subtitle="Enter your email to receive a recovery link"
                footer={
                    <Link
                        className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-primary dark:text-neutral-400 dark:hover:text-primary"
                        to="/login"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField
                        id="email"
                        name="email"
                        type="email"
                        label="Email address"
                        placeholder="name@example.com"
                        leftIcon={<Mail className="h-4 w-4" />}
                        required
                    />

                    {isSuccess ? (
                        <div
                            className="rounded-lg border border-success/20 bg-success/10 p-4 dark:bg-success/20"
                            id="success-message"
                        >
                            <p className="text-center text-sm text-success">
                                If this email is registered, we have sent a
                                password reset link.
                            </p>
                        </div>
                    ) : null}

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting}
                    >
                        <span>
                            {isSubmitting ? "Sending..." : "Send Recovery Link"}
                        </span>
                        <ArrowRight className="h-4 w-4" />
                    </Button>

                    {error ? (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    ) : null}
                </form>
            </AuthCard>

            <div className="mt-6 flex justify-center gap-6 text-xs text-neutral-400 dark:text-neutral-500">
                <div className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    Secure Encryption
                </div>
                <div className="flex items-center gap-1.5">
                    <Verified className="h-4 w-4" />
                    Spam Protection
                </div>
            </div>
        </div>
    );
}
