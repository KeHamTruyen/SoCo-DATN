import { History, User, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { marketplaceApi } from "../../marketplace/api/marketplaceApi";
import type { ProductListItem } from "../../marketplace/types/marketplace.types";
import { profileApi } from "../api/profileApi";
import type { PublicUserProfile } from "../types/profile.types";

interface BuyerProfileSelfSidebarProps {
    suggestedUsers: PublicUserProfile[];
    suggestedLoading?: boolean;
}

export function BuyerProfileSelfSidebar({ suggestedUsers, suggestedLoading }: BuyerProfileSelfSidebarProps) {
    const [followed, setFollowed] = useState<Set<string>>(new Set());
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);

    useEffect(() => {
        void (async () => {
            try {
                const res = await marketplaceApi.listProducts({ page: 1, pageSize: 4 });
                setProducts(res.items ?? []);
            } catch {
                setProducts([]);
            } finally {
                setProductsLoading(false);
            }
        })();
    }, []);

    const handleFollow = (userId: string) => {
        setFollowed((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
                void profileApi.unfollowUser(userId);
            } else {
                next.add(userId);
                void profileApi.followUser(userId);
            }
            return next;
        });
    };

    const displayUsers = suggestedUsers.slice(0, 4);

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold dark:text-white">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Gợi ý bạn bè
                </h3>
                {suggestedLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex animate-pulse items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                                <div className="flex-1 space-y-1">
                                    <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-700" />
                                    <div className="h-2 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayUsers.length === 0 ? (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Chưa có gợi ý.</p>
                ) : (
                    <div className="space-y-4">
                        {displayUsers.map((u) => (
                            <div key={u.id} className="flex items-center justify-between gap-2">
                                <Link to={`/profile/${u.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                        {u.avatarUrl ? (
                                            <img
                                                src={u.avatarUrl}
                                                alt={u.fullName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center">
                                                <User className="h-4 w-4 text-neutral-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold dark:text-neutral-100">
                                            {u.fullName}
                                        </p>
                                        <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                                            {u.username ? `@${u.username}` : "Thành viên"}
                                        </p>
                                    </div>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleFollow(u.id)}
                                    className={`shrink-0 text-sm font-bold transition-colors hover:underline ${
                                        followed.has(u.id) ? "text-neutral-400" : "text-primary"
                                    }`}
                                >
                                    {followed.has(u.id) ? "Đang theo" : "Theo dõi"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    type="button"
                    className="mt-4 w-full py-2 text-center text-sm font-medium text-neutral-500 transition-colors hover:text-primary dark:text-neutral-400"
                >
                    Xem tất cả gợi ý
                </button>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold dark:text-white">
                    <History className="h-5 w-5 text-primary" />
                    Đã xem gần đây
                </h3>
                {productsLoading ? (
                    <div className="grid grid-cols-2 gap-3">
                        {[1, 2].map((i) => (
                            <div key={i} className="animate-pulse space-y-2">
                                <div className="aspect-square rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                                <div className="h-3 rounded bg-neutral-200 dark:bg-neutral-700" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Chưa có sản phẩm.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {products.map((p) => (
                            <Link key={p.id} to={`/products/${p.id}`} className="group cursor-pointer">
                                <div className="mb-2 aspect-square overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    {p.imageUrl ? (
                                        <img
                                            src={p.imageUrl}
                                            alt={p.name}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                                            Sản phẩm
                                        </div>
                                    )}
                                </div>
                                <p className="truncate text-xs font-medium dark:text-neutral-200">{p.name}</p>
                                <p className="text-xs font-bold text-primary">
                                    {typeof p.price === "number"
                                        ? p.price.toLocaleString("vi-VN", {
                                              style: "currency",
                                              currency: "VND",
                                          })
                                        : "—"}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
