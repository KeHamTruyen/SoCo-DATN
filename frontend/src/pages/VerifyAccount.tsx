import { ArrowLeft, BadgeCheck, Mail, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthActions } from "../features/auth/hooks/useAuthActions";
import { HttpError } from "../shared/api/httpClient";
import { AuthCard, Button, OtpInput } from "../shared/ui";

const COOLDOWN_SECONDS = 60;

export default function VerifyAccount() {
    const navigate = useNavigate();
    const { verifyAccount, completeLogin, resendVerification } = useAuthActions();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resendSuccess, setResendSuccess] = useState<string | null>(null);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(COOLDOWN_SECONDS);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const pendingEmail = sessionStorage.getItem("soco.pendingEmail") ?? "";

    // Start countdown on mount
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current!);
    }, []);

    const formatCooldown = (secs: number) => {
        const m = String(Math.floor(secs / 60)).padStart(2, "0");
        const s = String(secs % 60).padStart(2, "0");
        return `${m}:${s}`;
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const otpCode = Array.from({ length: 6 })
            .map((_, idx) => String(formData.get(`otp_${idx + 1}`) ?? ""))
            .join("");
        const tempToken = sessionStorage.getItem("soco.tempToken") ?? "";

        void (async () => {
            setError(null);
            setIsSubmitting(true);
            try {
                const auth = await verifyAccount({ otpCode, tempToken });
                completeLogin(auth);
                sessionStorage.removeItem("soco.tempToken");
                sessionStorage.removeItem("soco.pendingEmail");
                navigate("/feed");
            } catch (err) {
                const message =
                    err instanceof HttpError
                        ? err.message
                        : "Unable to verify account. Please try again.";
                setError(message);
            } finally {
                setIsSubmitting(false);
            }
        })();
    };

    const handleResend = () => {
        if (cooldown > 0 || !pendingEmail) return;

        void (async () => {
            setError(null);
            setResendSuccess(null);
            setIsResending(true);
            try {
                const result = await resendVerification(pendingEmail);
                // Update the tempToken if the backend issues a new one
                if (result.tempToken) {
                    sessionStorage.setItem("soco.tempToken", result.tempToken);
                }
                setResendSuccess("A new code has been sent to your email.");
                // Restart the countdown
                setCooldown(COOLDOWN_SECONDS);
                clearInterval(intervalRef.current!);
                intervalRef.current = setInterval(() => {
                    setCooldown((prev) => {
                        if (prev <= 1) {
                            clearInterval(intervalRef.current!);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } catch (err) {
                const message =
                    err instanceof HttpError
                        ? err.message
                        : "Failed to resend code. Please try again.";
                setError(message);
            } finally {
                setIsResending(false);
            }
        })();
    };

    return (
        <div className="w-full max-w-[460px]">
            <AuthCard
                title="Verify Your Account"
                subtitle={
                    <>
                        We've sent a 6-digit confirmation code to{" "}
                        <span className="font-medium text-neutral-900 dark:text-white">
                            {pendingEmail || "your email"}
                        </span>
                    </>
                }
                className="max-w-none"
                footer={
                    <Link
                        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-primary"
                        to="/login"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>
                }
            >
                <div className="relative mb-1 flex justify-center">
                    <div className="mb-1 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                        <Mail className="h-10 w-10 text-primary" />
                    </div>
                        <div className="absolute -bottom-1 right-[calc(50%-3.25rem)] rounded-full bg-white p-1 shadow-sm dark:bg-background-dark">
                        <BadgeCheck className="h-5 w-5 text-success" />
                    </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <OtpInput className="pt-2" />

                    <div className="space-y-4">
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Confirming..." : "Confirm Account"}
                        </Button>

                        <div className="flex flex-col items-center gap-1">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                Didn't receive a code?
                            </p>
                            {cooldown > 0 ? (
                                <p className="flex items-center gap-1.5 text-sm text-neutral-400 dark:text-neutral-600">
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Resend code in{" "}
                                    <span className="font-semibold text-primary tabular-nums">
                                        {formatCooldown(cooldown)}
                                    </span>
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={isResending}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-primary transition-opacity hover:opacity-80 disabled:opacity-50"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    {isResending ? "Sending..." : "Resend code"}
                                </button>
                            )}
                        </div>

                        {resendSuccess ? (
                            <p className="rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-sm text-success dark:bg-success/20">
                                {resendSuccess}
                            </p>
                        ) : null}

                        {error ? (
                            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </p>
                        ) : null}
                    </div>
                </form>
            </AuthCard>
        </div>
    );
}
