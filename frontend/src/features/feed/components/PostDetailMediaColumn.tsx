import { ShoppingCart, Tag } from "lucide-react";
import type { FeedPost } from "../types/feed.types";
import { ShoppableProductHotspot } from "./ShoppableProductHotspot";
import { formatCurrencyVnd } from "../../../shared/lib/formatCurrencyVnd";
import { Link } from "react-router-dom";
import { PostMediaCarousel } from "./PostMediaCarousel";
import { layoutMediaHotspots } from "../utils/hotspotLayout";
import { resolvePostMediaUrls } from "../utils/postMediaUtils";

interface PostDetailMediaColumnProps {
    post: FeedPost;
    primaryMedia: string;
    isVideo: boolean;
}

export function PostDetailMediaColumn({ post, primaryMedia, isVideo }: PostDetailMediaColumnProps) {
    const hasProducts = (post.taggedProducts?.length ?? 0) > 0;
    const mediaTags = layoutMediaHotspots(
        post.taggedProducts?.filter((tag) => (tag.anchorType ?? "MEDIA_HOTSPOT") === "MEDIA_HOTSPOT") ?? [],
    );
    const resolvedUrls = resolvePostMediaUrls(post);
    const mediaUrls = resolvedUrls.length > 0 ? resolvedUrls : [primaryMedia];

    return (
        <div className="lg:col-span-7">
            <PostMediaCarousel
                mediaUrls={mediaUrls}
                mediaType={isVideo ? "VIDEO" : post.mediaType}
                className="aspect-4/5 rounded-2xl shadow-xl"
                imageAlt="Post"
            >
                {mediaTags.map((product) => (
                    <ShoppableProductHotspot key={product.id} product={product} />
                ))}
                {post.taggedProducts && post.taggedProducts.length > 0 && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow backdrop-blur-sm">
                        <Tag className="h-3 w-3 text-primary" />
                        {post.taggedProducts.length} product(s) tagged
                    </div>
                )}
            </PostMediaCarousel>

            {hasProducts && post.taggedProducts ? (
                <div className="mt-4 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-100 p-4 dark:border-neutral-800">
                        <h3 className="font-bold">Tagged Products</h3>
                    </div>
                    <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {post.taggedProducts.map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-4">
                                <Link
                                    to={product.productId ? `/products/${product.productId}` : "#"}
                                    className="flex min-w-0 flex-1 items-center gap-3 transition-opacity hover:opacity-80"
                                >
                                    {product.imageUrl && (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.productName}
                                            className="h-12 w-12 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-semibold">{product.productName}</p>
                                        <p className="text-sm font-bold text-primary">
                                            {formatCurrencyVnd(product.price)}
                                        </p>
                                    </div>
                                </Link>
                                {product.productId ? (
                                    <Link
                                        to={`/products/${product.productId}`}
                                        className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-700"
                                    >
                                        <ShoppingCart className="h-3 w-3" />
                                        View Product
                                    </Link>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
