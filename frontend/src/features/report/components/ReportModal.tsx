import { Flag, Lock, X } from "lucide-react";
import { useState } from "react";
import { reportApi } from "../api/reportApi";
import type { ReportReason, ReportTargetType } from "../types/report.types";
import { Button } from "../../../shared/ui/atoms/button";

const SOCIAL_REASONS: { value: ReportReason; label: string }[] = [
    { value: "inappropriate_content", label: "Inappropriate Content" },
    { value: "harassment", label: "Harassment or Bullying" },
    { value: "misinformation", label: "Misinformation" },
];

const COMMERCE_REASONS: { value: ReportReason; label: string }[] = [
    { value: "fake_product", label: "Fake / Counterfeit Product" },
    { value: "invalid_price", label: "Invalid Pricing" },
    { value: "untrusted_seller", label: "Untrusted Seller" },
];

interface ReportModalProps {
    targetType: ReportTargetType;
    targetId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export function ReportModal({ targetType, targetId, onClose, onSuccess }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) return;
        setIsSubmitting(true);
        try {
            await reportApi.createReport({ targetType, targetId, reason: selectedReason, description });
            setSubmitted(true);
            onSuccess?.();
        } catch {
            // silently ignore
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-center justify-between border-b border-neutral-100 p-6 dark:border-neutral-800">
                    <h2 className="flex items-center gap-2 text-xl font-bold">
                        <Flag className="h-5 w-5 text-primary" />
                        Report Violation
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {submitted ? (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 dark:bg-success/20">
                            <Flag className="h-8 w-8 text-success" />
                        </div>
                        <h3 className="text-lg font-bold">Report Submitted</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Thank you for your report. Our team will review it within 24 hours.
                        </p>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                ) : (
                    <>
                        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
                            <div>
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                    Social Content
                                </h3>
                                <div className="space-y-3">
                                    {SOCIAL_REASONS.map((r) => (
                                        <label
                                            key={r.value}
                                            className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
                                        >
                                            <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                {r.label}
                                            </span>
                                            <input
                                                type="radio"
                                                name="report_reason"
                                                value={r.value}
                                                checked={selectedReason === r.value}
                                                onChange={() => setSelectedReason(r.value)}
                                                className="text-primary focus:ring-primary"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                    Commerce Violations
                                </h3>
                                <div className="space-y-3">
                                    {COMMERCE_REASONS.map((r) => (
                                        <label
                                            key={r.value}
                                            className="flex cursor-pointer items-center justify-between rounded-lg border border-neutral-200 p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
                                        >
                                            <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                {r.label}
                                            </span>
                                            <input
                                                type="radio"
                                                name="report_reason"
                                                value={r.value}
                                                checked={selectedReason === r.value}
                                                onChange={() => setSelectedReason(r.value)}
                                                className="text-primary focus:ring-primary"
                                            />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                                    Additional Details
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please provide more details..."
                                    rows={3}
                                    className="w-full min-h-[100px] resize-none rounded-lg border border-neutral-200 bg-white p-3 text-neutral-900 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                                />
                                <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                                    <Lock className="h-3 w-3" />
                                    All reports are reviewed confidentially by our admin team
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-800/30">
                            <Button variant="ghost" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => void handleSubmit()}
                                disabled={!selectedReason || isSubmitting}
                            >
                                {isSubmitting ? "Submitting..." : "Submit Report"}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
