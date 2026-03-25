import { useMemo, useState } from "react";
import { sellerDashboardApi } from "../api/sellerDashboardApi";
import type { SellerProductRow } from "../types/sellerDashboard.types";
import { SellerDashboardProductTable } from "./SellerDashboardProductTable";
import { SellerStockAdjustDialog } from "./SellerStockAdjustDialog";

type InventorySort = "stockAsc" | "stockDesc" | "title" | "lowStockFirst";

interface SellerDashboardInventoryPanelProps {
    items: SellerProductRow[];
    loading: boolean;
    onProductsUpdated: () => void;
}

export function SellerDashboardInventoryPanel({
    items,
    loading,
    onProductsUpdated,
}: SellerDashboardInventoryPanelProps) {
    const [sort, setSort] = useState<InventorySort>("lowStockFirst");
    const [search, setSearch] = useState("");
    const [dialogProduct, setDialogProduct] = useState<SellerProductRow | null>(
        null,
    );
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const stats = useMemo(() => {
        const lowCount = items.filter(
            (p) => p.stockQuantity <= p.lowStockThreshold,
        ).length;
        const totalStock = items.reduce((s, p) => s + p.stockQuantity, 0);
        return { lowCount, totalStock, count: items.length };
    }, [items]);

    const sorted = useMemo(() => {
        const q = search.trim().toLowerCase();
        let list = q
            ? items.filter((p) => p.title.toLowerCase().includes(q))
            : [...items];
        if (sort === "stockAsc") {
            list.sort((a, b) => a.stockQuantity - b.stockQuantity);
        } else if (sort === "stockDesc") {
            list.sort((a, b) => b.stockQuantity - a.stockQuantity);
        } else if (sort === "title") {
            list.sort((a, b) => a.title.localeCompare(b.title, "vi"));
        } else {
            list.sort((a, b) => {
                const ra = a.stockQuantity - a.lowStockThreshold;
                const rb = b.stockQuantity - b.lowStockThreshold;
                return ra - rb;
            });
        }
        return list;
    }, [items, sort, search]);

    function openAdjust(p: SellerProductRow) {
        setDialogProduct(p);
        setSaveError(null);
        setDialogOpen(true);
    }

    async function handleSaveStock(
        stockQuantity: number,
        lowStockThreshold: number,
    ) {
        if (!dialogProduct) return;
        setSaving(true);
        setSaveError(null);
        try {
            await sellerDashboardApi.updateSellerProduct(dialogProduct.id, {
                stockQuantity,
                lowStockThreshold,
            });
            setDialogOpen(false);
            setDialogProduct(null);
            onProductsUpdated();
        } catch {
            setSaveError("Không lưu được. Thử lại sau.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    Inventory
                </h2>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                    Theo dõi tồn kho và ngưỡng cảnh báo; cập nhật số lượng nhanh mà không
                    cần rời dashboard.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        SKU đang quản lý
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                        {stats.count}
                    </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                    <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        Tổng đơn vị tồn
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                        {stats.totalStock.toLocaleString("vi-VN")}
                    </p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
                    <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
                        Sắp hết (≤ ngưỡng)
                    </p>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-amber-900 dark:text-amber-100">
                        {stats.lowCount}
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <input
                    type="search"
                    placeholder="Tìm theo tên sản phẩm…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 sm:max-w-xs"
                />
                <label className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-400 sm:flex-row sm:items-center sm:gap-3">
                    <span className="shrink-0 font-medium">Sắp xếp</span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as InventorySort)}
                        className="w-full max-w-xs rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
                    >
                        <option value="lowStockFirst">
                            Ưu tiên tồn thấp (so với ngưỡng)
                        </option>
                        <option value="stockAsc">Tồn kho tăng dần</option>
                        <option value="stockDesc">Tồn kho giảm dần</option>
                        <option value="title">Tên A–Z</option>
                    </select>
                </label>
            </div>

            {!loading && items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-neutral-200 py-12 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                    Chưa có sản phẩm. Tạo sản phẩm qua API hoặc công cụ quản trị, sau đó
                    quản lý tồn tại đây.
                </div>
            ) : (
                <SellerDashboardProductTable
                    mode="inventory"
                    items={sorted}
                    loading={loading}
                    onAdjustStock={openAdjust}
                />
            )}

            <SellerStockAdjustDialog
                product={dialogProduct}
                open={dialogOpen}
                saving={saving}
                error={saveError}
                onClose={() => {
                    if (!saving) {
                        setDialogOpen(false);
                        setDialogProduct(null);
                        setSaveError(null);
                    }
                }}
                onSave={handleSaveStock}
            />
        </div>
    );
}
