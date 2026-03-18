import { ArrowRight, CheckCircle2, LockKeyhole, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuthActions } from "../features/auth/hooks/useAuthActions";
import { HttpError } from "../shared/api/httpClient";
import { Button, Card, PasswordField } from "../shared/ui";

export default function ResetPassword() {
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const { resetPassword } = useAuthActions();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const token =
            String(formData.get("token") ?? "") ||
            searchParams.get("token") ||
            "";
        const newPassword = String(formData.get("newPassword") ?? "");
        const confirmPassword = String(formData.get("confirmPassword") ?? "");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        void (async () => {
            setError(null);
            setIsSubmitting(true);
            try {
                await resetPassword(token, newPassword, confirmPassword);
                setIsSuccess(true);
            } catch (err) {
                const message =
                    err instanceof HttpError
                        ? err.message
                        : "Unable to reset password. Please try again.";
                setError(message);
            } finally {
                setIsSubmitting(false);
            }
        })();
    };

    return (
        <div className="w-full max-w-md">
            {isSuccess ? (
                <Card className="overflow-hidden border-slate-200 p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                        Password Reset Successful
                    </h1>
                    <p className="mb-8 text-slate-500 dark:text-slate-400">
                        Your password has been successfully updated. You can now
                        use your new password to sign in to your account.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
                    >
                        <span>Go to Login</span>
                        <LogIn className="h-4 w-4" />
                    </Link>
                </Card>
            ) : (
                <Card className="overflow-hidden border-slate-200 shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="p-8">
                        <div className="mb-8 text-center">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <LockKeyhole className="h-6 w-6" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Reset Password
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">
                                Please enter a new, secure password for your
                                account. Ensure it meets the security
                                requirements.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <input
                                id="token"
                                name="token"
                                type="hidden"
                                value={searchParams.get("token") ?? ""}
                            />
                            <PasswordField
                                id="newPassword"
                                name="newPassword"
                                label="New Password"
                                minLength={8}
                                placeholder="••••••••"
                                helperText="Password must include uppercase, lowercase, and at least one number."
                                required
                            />

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-slate-500 dark:text-slate-400">
                                        Security Requirement:
                                    </span>
                                    <span className="font-medium text-primary">
                                        8+ chars, A-z, 0-9
                                    </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                    <div className="h-full w-3/4 rounded-full bg-emerald-500" />
                                </div>
                            </div>

                            <PasswordField
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirm New Password"
                                placeholder="••••••••"
                                required
                            />

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                <span>
                                    {isSubmitting
                                        ? "Resetting password..."
                                        : "Reset password"}
                                </span>
                                <ArrowRight className="h-4 w-4" />
                            </Button>

                            {error ? (
                                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                                    {error}
                                </p>
                            ) : null}
                        </form>
                    </div>
                    <div className="border-t border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-800/30">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Securely encrypted by SocialShop Guard.
                        </p>
                    </div>
                </Card>
            )}

            <div className="mt-8 flex justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                <a className="transition-colors hover:text-primary" href="#">
                    Privacy Policy
                </a>
                <a className="transition-colors hover:text-primary" href="#">
                    Contact Support
                </a>
            </div>
        </div>
    );
}
