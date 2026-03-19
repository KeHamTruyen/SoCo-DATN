import { CheckCircle2, Circle } from "lucide-react";
import type { OrderStatus, OrderTimeline as OrderTimelineType } from "../types/order.types";

const STEPS: { status: OrderStatus; label: string }[] = [
    { status: "pending", label: "Order Placed" },
    { status: "confirmed", label: "Confirmed" },
    { status: "shipping", label: "Shipping" },
    { status: "delivered", label: "Delivered" },
];

interface OrderTimelineProps {
    currentStatus: OrderStatus;
    timeline?: OrderTimelineType[];
}

export function OrderTimeline({ currentStatus, timeline }: OrderTimelineProps) {
    const isCancelled = currentStatus === "cancelled" || currentStatus === "refunded";
    const stepIndex = STEPS.findIndex((s) => s.status === currentStatus);

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-6 text-lg font-bold">Order Status</h2>
            {isCancelled ? (
                <div className="rounded-lg bg-destructive/10 p-4 text-center text-sm font-medium text-destructive dark:bg-destructive/20">
                    This order has been {currentStatus}.
                </div>
            ) : (
                <div className="relative">
                    <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-neutral-200 dark:bg-neutral-700" />
                    <div className="space-y-6">
                        {STEPS.map((step, idx) => {
                            const completed = idx <= stepIndex;
                            const entry = timeline?.find((t) => t.status === step.status);
                            return (
                                <div key={step.status} className="relative flex items-start gap-4 pl-10">
                                    <div className="absolute left-0 flex h-8 w-8 shrink-0 items-center justify-center">
                                        {completed ? (
                                            <CheckCircle2 className="h-8 w-8 text-primary" />
                                        ) : (
                                            <Circle className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p
                                            className={
                                                completed
                                                    ? "font-semibold text-neutral-900 dark:text-neutral-100"
                                                    : "font-medium text-neutral-400"
                                            }
                                        >
                                            {step.label}
                                        </p>
                                        {entry?.timestamp && (
                                            <p className="text-xs text-neutral-400">
                                                {new Date(entry.timestamp).toLocaleString()}
                                            </p>
                                        )}
                                        {entry?.note && (
                                            <p className="text-xs text-neutral-500">{entry.note}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
