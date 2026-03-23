import { useCallback, useEffect, useState } from "react";
import { adminApi, type AdminPostRow, type AdminProductRow } from "@/api/adminApi";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

export default function ContentPage() {
    const [tab, setTab] = useState<"posts" | "products">("posts");
    const [posts, setPosts] = useState<AdminPostRow[]>([]);
    const [products, setProducts] = useState<AdminProductRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [delPost, setDelPost] = useState<string | null>(null);
    const [delProduct, setDelProduct] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            if (tab === "posts") {
                const d = await adminApi.getPosts({ page: 1, limit: 30 });
                setPosts(d.posts);
            } else {
                const d = await adminApi.getProducts({ page: 1, limit: 30 });
                setProducts(d.products);
            }
        } catch {
            if (tab === "posts") setPosts([]);
            else setProducts([]);
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                    Content management
                </h2>
                <p className="mt-1 text-muted-foreground">
                    Posts and products (UC4.2)
                </p>
            </header>

            <div className="mb-6 flex gap-2 border-b border-border">
                {(["posts", "products"] as const).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={
                            tab === t
                                ? "border-b-2 border-primary pb-2 text-sm font-semibold text-primary"
                                : "pb-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                        }
                    >
                        {t === "posts" ? "Posts" : "Products"}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="h-40 animate-pulse rounded-xl bg-muted" />
            ) : tab === "posts" ? (
                <div className="space-y-3">
                    {posts.map((p) => (
                        <div
                            key={p.id}
                            className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
                        >
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    @{p.author.username}
                                </p>
                                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                    {p.content || "(media only)"}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {p.status} · {new Date(p.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDelPost(p.id)}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 dark:border-red-900/40"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {products.map((p) => (
                        <div
                            key={p.id}
                            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
                        >
                            <div className="flex items-center gap-3">
                                {p.images[0]?.imageUrl ? (
                                    <img
                                        src={p.images[0].imageUrl}
                                        alt=""
                                        className="size-14 rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="size-14 rounded-lg bg-muted" />
                                )}
                                <div>
                                    <p className="font-semibold text-foreground">
                                        {p.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {p.seller.username} · {p.status}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDelProduct(p.id)}
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 dark:border-red-900/40"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={Boolean(delPost)}
                title="Delete post?"
                variant="danger"
                onClose={() => setDelPost(null)}
                onConfirm={async () => {
                    if (!delPost) return;
                    try {
                        await adminApi.deletePost(delPost);
                        setPosts((prev) => prev.filter((x) => x.id !== delPost));
                    } catch {
                        /* ignore */
                    }
                }}
            />
            <ConfirmDialog
                open={Boolean(delProduct)}
                title="Delete product?"
                variant="danger"
                onClose={() => setDelProduct(null)}
                onConfirm={async () => {
                    if (!delProduct) return;
                    try {
                        await adminApi.deleteProduct(delProduct);
                        setProducts((prev) =>
                            prev.filter((x) => x.id !== delProduct),
                        );
                    } catch {
                        /* ignore */
                    }
                }}
            />
        </div>
    );
}
