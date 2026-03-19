import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthActions } from "../features/auth/hooks/useAuthActions";
import { HttpError } from "../shared/api/httpClient";
import { Button, Card, OtpInput } from "../shared/ui";

export default function Verify() {
    const navigate = useNavigate();
    const { verify2fa, completeLogin } = useAuthActions();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const otpCode = Array.from({ length: 6 })
            .map((_, idx) => String(formData.get(`otp_${idx + 1}`) ?? ""))
            .join("");
        const tempToken = sessionStorage.getItem("soco.tempToken") ?? undefined;

        void (async () => {
            setError(null);
            setIsSubmitting(true);
            try {
                const auth = await verify2fa({ otpCode, tempToken });
                completeLogin(auth);
                sessionStorage.removeItem("soco.tempToken");
                navigate("/feed");
            } catch (err) {
                const message =
                    err instanceof HttpError
                        ? err.message
                        : "Unable to verify OTP. Please try again.";
                setError(message);
            } finally {
                setIsSubmitting(false);
            }
        })();
    };

    return (
        <Card className="w-full max-w-md overflow-hidden border-neutral-200 p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
            <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                    <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <h1 className="mb-2 text-2xl font-bold tracking-tight">
                    Two-Factor Authentication
                </h1>
                <p className="mb-8 text-sm text-neutral-500 dark:text-neutral-400">
                    OTP has been sent to your email
                </p>

                <form className="w-full space-y-8" onSubmit={handleSubmit}>
                    <input name="tempToken" type="hidden" value="" />
                    <OtpInput />

                    <div className="space-y-4">
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Verifying..." : "Verify"}
                        </Button>
                        <div className="flex items-center justify-center gap-1 text-sm">
                            <span className="text-neutral-500 dark:text-neutral-400">
                                Didn't receive code?
                            </span>
                            <button
                                className="text-primary font-medium hover:underline"
                                type="button"
                            >
                                Resend code
                            </button>
                        </div>
                        {error ? (
                            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </p>
                        ) : null}
                    </div>
                </form>
            </div>
        </Card>
    );
}
