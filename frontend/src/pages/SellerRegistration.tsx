import { ArrowLeft, BadgeCheck, Building2, CreditCard, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../shared/ui/organisms/brand-logo/BrandLogo";
import { Button } from "../shared/ui/atoms/button";
import { cn } from "../shared/lib/cn";
import { SellerRegistrationProvider, useSellerRegistrationContext } from "../features/seller/context/SellerRegistrationContext";
import { RegistrationStatusView } from "../features/seller/components/registration/RegistrationStatusView";
import { RegistrationStepOne } from "../features/seller/components/registration/RegistrationStepOne";
import { RegistrationStepTwo } from "../features/seller/components/registration/RegistrationStepTwo";
import { RegistrationStepThree } from "../features/seller/components/registration/RegistrationStepThree";

const STEPS = [
    { step: 1, label: "General Info", icon: <Building2 className="h-3.5 w-3.5" /> },
    { step: 2, label: "Verification", icon: <BadgeCheck className="h-3.5 w-3.5" /> },
    { step: 3, label: "Payment Setup", icon: <CreditCard className="h-3.5 w-3.5" /> },
];

const shellClass = "flex min-h-screen flex-col items-center bg-background-light px-4 py-12 text-neutral-900 dark:bg-background-dark dark:text-neutral-100";

function SellerRegistrationForm() {
    const {
        step, setStep, isSubmitting, error,
        goNext, handleSubmit,
        applicationStatus, statusLoading, isAlreadySeller, statusError
    } = useSellerRegistrationContext();

    if (statusLoading || statusError || isAlreadySeller || applicationStatus?.status === "REVIEWING") {
        return <RegistrationStatusView />;
    }

    const progress = ((step - 1) / 3) * 100 + 33.33;

    return (
        <div className={shellClass}>
            <div className="mb-8">
                <BrandLogo />
            </div>
            <div className="w-full max-w-4xl space-y-6">
                {/* Progress Header */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                                Step {step} of 3
                            </p>
                            <h1 className="text-2xl font-bold">
                                {step === 1 ? "Shop Information" : step === 2 ? "Identity Verification" : "Payment Setup"}
                            </h1>
                        </div>
                        <span className="text-sm font-medium text-neutral-500">
                            {Math.round(progress)}% Complete
                        </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-4">
                        {STEPS.map(({ step: s, label }) => (
                            <div key={s} className="flex items-center gap-2">
                                <div
                                    className={cn(
                                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                        step >= s ? "bg-primary text-white" : "bg-neutral-200 text-neutral-500 dark:bg-neutral-700",
                                    )}
                                >
                                    {s}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-medium",
                                        step >= s ? "font-semibold text-neutral-900 dark:text-neutral-100" : "text-neutral-400",
                                    )}
                                >
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Body */}
                <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="p-8">
                        {step === 1 && <RegistrationStepOne />}
                        {step === 2 && <RegistrationStepTwo />}
                        {step === 3 && <RegistrationStepThree />}
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-200 bg-neutral-50 px-8 py-6 dark:border-neutral-800 dark:bg-neutral-900">
                        {step > 1 ? (
                            <Button variant="outline" onClick={() => { setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3); }} disabled={isSubmitting}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-4">
                            {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
                            
                            {step < 3 ? (
                                <Button onClick={goNext}>Continue</Button>
                            ) : (
                                <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        "Submit Application"
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
                
                <p className="text-center text-sm text-neutral-500">
                    By submitting this application, you agree to our{" "}
                    <Link to="/terms" className="font-medium text-primary hover:underline">Seller Terms of Service</Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="font-medium text-primary hover:underline">Privacy Policy</Link>.
                </p>
            </div>
        </div>
    );
}

export default function SellerRegistration() {
    return (
        <SellerRegistrationProvider>
            <SellerRegistrationForm />
        </SellerRegistrationProvider>
    );
}
