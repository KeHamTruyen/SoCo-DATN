import { ShoppingCart, Tag } from "lucide-react";
import { Button } from "../../../shared/ui/atoms/button";
import type { FeedPost } from "../types/feed.types";
import { ShoppableProductHotspot } from "./ShoppableProductHotspot";
import { formatCurrencyVnd } from "../../../shared/lib/formatCurrencyVnd";

interface PostDetailMediaColumnProps {
    post: FeedPost;
    primaryMedia: string;
    isVideo: boolean;
}

export function PostDetailMediaColumn({ post, primaryMedia, isVideo }: PostDetailMediaColumnProps) {
    const hasProducts = (post.taggedProducts?.length ?? 0) > 0;
    const mediaTags =
        post.taggedProducts?.filter((tag) => (tag.anchorType ?? "MEDIA_HOTSPOT") === "MEDIA_HOTSPOT") ?? [];

    return (
        <div className="lg:col-span-7">
            <div className="group relative aspect-4/5 overflow-hidden rounded-2xl bg-neutral-200 shadow-xl dark:bg-neutral-800">
                {isVideo ? (
                    <video
                        src={primaryMedia}
                        controls
                        className="h-full w-full object-cover"
                        playsInline
                    />
                ) : (
                    <img src={primaryMedia} alt="Post" className="h-full w-full object-cover" />
                )}
                {mediaTags.map((product) => (
                    <ShoppableProductHotspot key={product.id} product={product} />
                ))}
                {post.taggedProducts && post.taggedProducts.length > 0 && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow backdrop-blur-sm">
                        <Tag className="h-3 w-3 text-primary" />
                        {post.taggedProducts.length} product(s) tagged
                    </div>
                )}
            </div>

            {hasProducts && post.taggedProducts ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-100 p-4 dark:border-neutral-800">
                        <h3 className="font-bold">Tagged Products</h3>
                    </div>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {post.taggedProducts.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    {product.imageUrl && (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.productName}
                                            className="h-12 w-12 rounded-lg object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="font-semibold">{product.productName}</p>
                                        <p className="text-sm font-bold text-primary">
                                            {formatCurrencyVnd(product.price)}
                                        </p>
                                    </div>
                                </div>
                                <Button size="sm" className="gap-1">
                                    <ShoppingCart className="h-3 w-3" />
                                    Add to Cart
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
