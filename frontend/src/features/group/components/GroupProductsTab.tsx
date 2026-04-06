import { useGroupContext } from "../context/GroupContext";

export function GroupProductsTab() {
    const { productRows, tabLoading } = useGroupContext();

    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            {tabLoading ? (
                <p className="text-sm text-neutral-500">Loading products...</p>
            ) : (
                <div className="space-y-2">
                    {productRows.map((row) => (
                        <div
                            key={String(row.id)}
                            className="rounded-lg border border-neutral-100 p-3 dark:border-neutral-800"
                        >
                            <p className="text-sm font-semibold">
                                {String(row.title ?? "Product")}
                            </p>
                            <p className="text-xs text-neutral-500">
                                {String(row.price ?? "")}
                            </p>
                        </div>
                    ))}
                    {!productRows.length && (
                        <p className="text-sm text-neutral-500">No tagged products.</p>
                    )}
                </div>
            )}
        </div>
    );
}
