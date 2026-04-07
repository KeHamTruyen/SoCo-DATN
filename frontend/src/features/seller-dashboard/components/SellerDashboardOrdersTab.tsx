import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Order } from "../../order/types/order.types";
import type { OrderStatus } from "../../order/types/order.types";
import { SellerDashboardOrdersPanel } from "./SellerDashboardOrdersPanel";

interface SellerDashboardOrdersTabProps {
    orders: Order[];
    loading: boolean;
    onOrderChanged?: () => void;
}

export function SellerDashboardOrdersTab({
    orders,
    loading,
    onOrderChanged,
}: SellerDashboardOrdersTabProps) {
    const { t } = useTranslation();
    const [status, setStatus] = useState<OrderStatus | "all">("all");
    const [q, setQ] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 8;
    const statusLabel = (s: OrderStatus) => t(`sellerDashboard.orders.status.${s}`, s);

    const STATUS_TABS: Array<OrderStatus | "all"> = ["all", "pending", "processing", "shipping", "completed", "cancelled"];

    const baseFilteredOrders = useMemo(() => {
        const keyword = q.trim().toLowerCase();
        const fromTs = from ? new Date(from).getTime() : Number.NEGATIVE_INFINITY;
        const toTs = to ? new Date(to).getTime() + 86_399_999 : Number.POSITIVE_INFINITY;
        return orders.filter((order) => {
            if (status !== "all" && order.status !== status) return false;
            const createdTs = new Date(order.createdAt).getTime();
            if (createdTs < fromTs || createdTs > toTs) return false;
            if (!keyword) return true;
            const haystack = `${order.orderNumber} ${order.buyerName ?? ""}`.toLowerCase();
            return haystack.includes(keyword);
        });
    }, [orders, status, q, from, to]);

    const filteredOrders = baseFilteredOrders;

    const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
    const pageOrders = useMemo(() => {
        const currentPage = Math.min(page, totalPages);
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredOrders.slice(start, start + PAGE_SIZE);
    }, [filteredOrders, page, totalPages]);

    const pageNumbers = useMemo(() => {
        const visible = 3;
        const current = Math.min(page, totalPages);
        const start = Math.max(1, current - 1);
        const end = Math.min(totalPages, start + visible - 1);
        return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
    }, [page, totalPages]);

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                    <div className="flex w-full flex-1 gap-4">
                        <div className="relative flex-1">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M8.75 3.75a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 0L16.25 16.25"
                                        stroke="currentColor"
                                        strokeWidth="1.75"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>
                            <input
                                className="w-full rounded-md bg-neutral-50 px-4 py-2.5 pl-10 text-sm transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 dark:bg-neutral-800 dark:focus:bg-neutral-900"
                                placeholder={t("sellerDashboard.orders.searchPlaceholder", "Search by Order ID or Buyer Name")}
                                type="text"
                                value={q}
                                onChange={(e) => {
                                    setQ(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDateRangeOpen((v) => !v)}
                                className="flex items-center gap-2 rounded-md bg-neutral-50 px-4 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                                <span className="text-neutral-400">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M8 7V3M16 7V3M4 11H20M6 5H18a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>
                                {t("sellerDashboard.orders.dateRange", "Date Range")}
                                <span className="text-neutral-400">
                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M6 9l6 6 6-6"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </button>
                            {isDateRangeOpen ? (
                                <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
                                    <div className="grid grid-cols-1 gap-3">
                                        <label className="text-xs font-semibold text-neutral-500">
                                            {t("sellerDashboard.orders.from", "From")}
                                            <input
                                                type="date"
                                                value={from}
                                                onChange={(e) => {
                                                    setFrom(e.target.value);
                                                    setPage(1);
                                                }}
                                                className="mt-1 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                            />
                                        </label>
                                        <label className="text-xs font-semibold text-neutral-500">
                                            {t("sellerDashboard.orders.to", "To")}
                                            <input
                                                type="date"
                                                value={to}
                                                onChange={(e) => {
                                                    setTo(e.target.value);
                                                    setPage(1);
                                                }}
                                                className="mt-1 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                            />
                                        </label>
                                        <div className="flex items-center justify-between">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFrom("");
                                                    setTo("");
                                                    setPage(1);
                                                }}
                                                className="text-xs font-semibold text-neutral-500 hover:underline"
                                            >
                                                {t("sellerDashboard.orders.clear", "Clear")}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsDateRangeOpen(false)}
                                                className="rounded-md bg-primary px-3 py-2 text-xs font-bold text-white"
                                            >
                                                {t("sellerDashboard.orders.apply", "Apply")}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex w-full items-center gap-1 overflow-x-auto rounded-lg bg-neutral-100 p-1 md:w-auto dark:bg-neutral-800">
                        {STATUS_TABS.map((s) => (
                            <button
                                key={s}
                                className={`rounded-md px-4 py-1.5 text-sm transition ${
                                    status === s
                                        ? "bg-white font-bold text-primary shadow-sm dark:bg-neutral-900"
                                        : "font-medium text-neutral-500 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700"
                                }`}
                                type="button"
                                onClick={() => {
                                    setStatus(s);
                                    setPage(1);
                                }}
                            >
                                {s === "all"
                                    ? t("sellerDashboard.orders.tabs.all", "All")
                                    : s === "completed"
                                      ? t("sellerDashboard.orders.tabs.completed", "Completed")
                                      : s === "cancelled"
                                        ? t("sellerDashboard.orders.tabs.cancelled", "Cancelled")
                                        : statusLabel(s)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <SellerDashboardOrdersPanel
                orders={pageOrders}
                loading={loading}
                onOrderChanged={onOrderChanged}
            />
            <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900">
                <span>
                    {t("sellerDashboard.orders.pagination.showing", "Showing {{shown}} of {{total}} orders", {
                        shown: pageOrders.length,
                        total: filteredOrders.length,
                    })}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="rounded border border-neutral-300 px-2 py-1 disabled:opacity-40 dark:border-neutral-700"
                    >
                        {t("sellerDashboard.orders.pagination.prev", "Prev")}
                    </button>
                    {pageNumbers.map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => setPage(n)}
                            className={`rounded border px-2 py-1 ${
                                n === page
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-neutral-300 dark:border-neutral-700"
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        className="rounded border border-neutral-300 px-2 py-1 disabled:opacity-40 dark:border-neutral-700"
                    >
                        {t("sellerDashboard.orders.pagination.next", "Next")}
                    </button>
                </div>
            </div>
        </div>
    );
}
