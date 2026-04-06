import { ShieldCheck } from "lucide-react";
import { useSellerRegistrationContext } from "../../context/SellerRegistrationContext";

export function RegistrationStepThree() {
    const { step3, setStep3 } = useSellerRegistrationContext();

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-5 py-4 dark:border-neutral-700 dark:bg-neutral-800/40">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                        <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            Secure Payouts
                        </h4>
                        <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                            Your earnings will be transferred to this bank account. Please ensure the account holder name matches your verified identity documents to avoid payout delays.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Bank Name</label>
                    <input
                        type="text"
                        value={step3.bankName}
                        onChange={(e) => setStep3((s) => ({ ...s, bankName: e.target.value }))}
                        placeholder="e.g. Vietcombank"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold">Account Number</label>
                    <input
                        type="text"
                        value={step3.accountNumber}
                        onChange={(e) => setStep3((s) => ({ ...s, accountNumber: e.target.value }))}
                        placeholder="Bank account number"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold">Account Holder Name</label>
                <input
                    type="text"
                    value={step3.accountHolderName}
                    onChange={(e) => setStep3((s) => ({ ...s, accountHolderName: e.target.value.toUpperCase() }))}
                    placeholder="Enter exactly as shown on your bank statement"
                    className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 uppercase"
                />
            </div>
        </div>
    );
}
