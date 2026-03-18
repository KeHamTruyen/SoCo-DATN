import { BadgeCheck, Building2, CreditCard, ImagePlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sellerApi } from "../features/seller/api/sellerApi";
import type {
    SellerRegistrationStep1,
    SellerRegistrationStep2,
    SellerRegistrationStep3,
} from "../features/seller/types/seller.types";
import { BrandLogo } from "../shared/ui/organisms/brand-logo/BrandLogo";
import { Button } from "../shared/ui/atoms/button";
import { cn } from "../shared/lib/cn";

type Step = 1 | 2 | 3;

const STEPS = [
    { step: 1 as Step, label: "General Info", icon: <Building2 className="h-3.5 w-3.5" /> },
    { step: 2 as Step, label: "Verification", icon: <BadgeCheck className="h-3.5 w-3.5" /> },
    { step: 3 as Step, label: "Payment Setup", icon: <CreditCard className="h-3.5 w-3.5" /> },
];

const CATEGORIES = [
    { value: "electronics", label: "Electronics" },
    { value: "fashion", label: "Fashion & Apparel" },
    { value: "home", label: "Home & Living" },
    { value: "beauty", label: "Beauty & Wellness" },
    { value: "other", label: "Other" },
];

const ID_TYPES = [
    { value: "national_id", label: "National ID Card" },
    { value: "passport", label: "Passport" },
    { value: "business_license", label: "Business License" },
];

export default function SellerRegistration() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [step1, setStep1] = useState<SellerRegistrationStep1>({
        shopName: "",
        shopCategory: "",
        shopDescription: "",
        shopAddress: "",
        contactPhone: "",
    });

    const [step2, setStep2] = useState<SellerRegistrationStep2>({
        idType: "national_id",
        idNumber: "",
    });

    const [step3, setStep3] = useState<SellerRegistrationStep3>({
        bankName: "",
        accountNumber: "",
        accountHolderName: "",
    });

    const progress = ((step - 1) / 3) * 100 + 33.33;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            await sellerApi.registerSeller({ ...step1, ...step2, ...step3 });
            navigate("/seller-registration/success");
        } catch {
            setError("Registration failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-background-light px-4 py-12 dark:bg-background-dark">
            <div className="mb-8">
                <BrandLogo />
            </div>
            <div className="w-full max-w-4xl space-y-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                                Step {step} of 3
                            </p>
                            <h1 className="text-2xl font-bold">
                                {step === 1 ? "Shop Information" : step === 2 ? "Identity Verification" : "Payment Setup"}
                            </h1>
                        </div>
                        <span className="text-sm font-medium text-slate-500">
                            {Math.round(progress)}% Complete
                        </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
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
                                        step >= s
                                            ? "bg-primary text-white"
                                            : "bg-slate-200 text-slate-500 dark:bg-slate-700",
                                    )}
                                >
                                    {s}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs font-medium",
                                        step >= s ? "font-semibold text-slate-900 dark:text-slate-100" : "text-slate-400",
                                    )}
                                >
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="p-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                    <div className="col-span-1 flex flex-col items-center">
                                        <label className="mb-3 block text-sm font-semibold">Shop Logo</label>
                                        <button
                                            type="button"
                                            className="group flex h-32 w-32 flex-col items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-primary dark:border-slate-700 dark:bg-slate-800/50"
                                        >
                                            <ImagePlus className="mb-1 h-8 w-8 text-slate-400 group-hover:text-primary" />
                                            <span className="text-[10px] font-medium text-slate-500">UPLOAD</span>
                                        </button>
                                        <p className="mt-2 text-center text-xs text-slate-500">
                                            Recommended: 500x500px
                                        </p>
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="mb-3 block text-sm font-semibold">Cover Photo</label>
                                        <button
                                            type="button"
                                            className="group flex h-32 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-primary dark:border-slate-700 dark:bg-slate-800/50"
                                        >
                                            <ImagePlus className="mb-1 h-8 w-8 text-slate-400 group-hover:text-primary" />
                                            <span className="text-xs font-medium text-slate-500">
                                                Click to upload shop banner
                                            </span>
                                        </button>
                                        <p className="mt-2 text-xs text-slate-500">
                                            Recommended: 1200x400px
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold">Shop Name</label>
                                        <input
                                            type="text"
                                            value={step1.shopName}
                                            onChange={(e) => setStep1((s) => ({ ...s, shopName: e.target.value }))}
                                            placeholder="Enter your business name"
                                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold">Shop Category</label>
                                        <select
                                            value={step1.shopCategory}
                                            onChange={(e) => setStep1((s) => ({ ...s, shopCategory: e.target.value }))}
                                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
                                        >
                                            <option value="">Select a category</option>
                                            {CATEGORIES.map((c) => (
                                                <option key={c.value} value={c.value}>
                                                    {c.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">Shop Description</label>
                                    <textarea
                                        value={step1.shopDescription}
                                        onChange={(e) => setStep1((s) => ({ ...s, shopDescription: e.target.value }))}
                                        placeholder="Tell customers about your shop, brand values, and what you sell..."
                                        rows={4}
                                        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold">Shop Address</label>
                                        <input
                                            type="text"
                                            value={step1.shopAddress}
                                            onChange={(e) => setStep1((s) => ({ ...s, shopAddress: e.target.value }))}
                                            placeholder="Business address"
                                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold">Contact Phone</label>
                                        <input
                                            type="tel"
                                            value={step1.contactPhone}
                                            onChange={(e) => setStep1((s) => ({ ...s, contactPhone: e.target.value }))}
                                            placeholder="+84 000 000 000"
                                            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">ID Document Type</label>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                        {ID_TYPES.map((type) => (
                                            <label
                                                key={type.value}
                                                className={cn(
                                                    "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
                                                    step2.idType === type.value
                                                        ? "border-primary bg-primary/5"
                                                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="idType"
                                                    value={type.value}
                                                    checked={step2.idType === type.value}
                                                    onChange={() =>
                                                        setStep2((s) => ({
                                                            ...s,
                                                            idType: type.value as SellerRegistrationStep2["idType"],
                                                        }))
                                                    }
                                                    className="text-primary focus:ring-primary"
                                                />
                                                <span className="text-sm font-medium">{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">ID Number</label>
                                    <input
                                        type="text"
                                        value={step2.idNumber}
                                        onChange={(e) => setStep2((s) => ({ ...s, idNumber: e.target.value }))}
                                        placeholder="Enter your ID number"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div>
                                        <label className="mb-3 block text-sm font-semibold">Front of ID</label>
                                        <button
                                            type="button"
                                            className="group flex h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-primary dark:border-slate-700 dark:bg-slate-800/50"
                                        >
                                            <ImagePlus className="mb-2 h-8 w-8 text-slate-400 group-hover:text-primary" />
                                            <span className="text-sm font-medium text-slate-500">
                                                Upload front image
                                            </span>
                                        </button>
                                    </div>
                                    <div>
                                        <label className="mb-3 block text-sm font-semibold">Back of ID</label>
                                        <button
                                            type="button"
                                            className="group flex h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-primary dark:border-slate-700 dark:bg-slate-800/50"
                                        >
                                            <ImagePlus className="mb-2 h-8 w-8 text-slate-400 group-hover:text-primary" />
                                            <span className="text-sm font-medium text-slate-500">
                                                Upload back image
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-400">
                                    Your bank details are encrypted and stored securely. They are only used for payouts.
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">Bank Name</label>
                                    <input
                                        type="text"
                                        value={step3.bankName}
                                        onChange={(e) => setStep3((s) => ({ ...s, bankName: e.target.value }))}
                                        placeholder="e.g. Vietcombank, Techcombank"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">Account Number</label>
                                    <input
                                        type="text"
                                        value={step3.accountNumber}
                                        onChange={(e) => setStep3((s) => ({ ...s, accountNumber: e.target.value }))}
                                        placeholder="Enter your bank account number"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">Account Holder Name</label>
                                    <input
                                        type="text"
                                        value={step3.accountHolderName}
                                        onChange={(e) => setStep3((s) => ({ ...s, accountHolderName: e.target.value }))}
                                        placeholder="Full name as on bank account"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 p-6 dark:border-slate-800">
                        {step > 1 ? (
                            <Button
                                variant="outline"
                                onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
                            >
                                Back
                            </Button>
                        ) : (
                            <Link to="/feed">
                                <Button variant="ghost">Cancel</Button>
                            </Link>
                        )}
                        {step < 3 ? (
                            <Button onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}>
                                Continue
                            </Button>
                        ) : (
                            <Button
                                onClick={() => void handleSubmit()}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Application"}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
