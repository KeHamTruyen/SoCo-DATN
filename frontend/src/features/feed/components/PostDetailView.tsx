import {
    Bookmark,
    Heart,
    MessageCircle,
    MoreHorizontal,
    Send,
    ShoppingCart,
    Tag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { savedItemsApi } from "../../saved-items/api/savedItemsApi";
import { Avatar } from "../../../shared/ui/atoms/avatar";
import { Button } from "../../../shared/ui/atoms/button";
import { cn } from "../../../shared/lib/cn";
import { formatTimeAgo } from "../../../shared/lib/formatTimeAgo";
import { feedApi } from "../api/feedApi";
import type { FeedComment, FeedPost, ShoppableProduct } from "../types/feed.types";

interface ShoppableHotspotProps {
    product: ShoppableProduct;
}

function ShoppableHotspot({ product }: ShoppableHotspotProps) {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="product-hotspot absolute"
            style={{ left: `${product.positionX}%`, top: `${product.positionY}%` }}
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-white transition-transform hover:scale-110"
            >
                <Tag className="h-3.5 w-3.5 text-primary" />
            </button>
            {open && (
                <div className="absolute bottom-full left-1/2 z-10 mb-2 w-56 -translate-x-1/2 rounded-xl border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="flex items-center gap-3">
                        {product.imageUrl && (
                            <img
                                src={product.imageUrl}
                                alt={product.productName}
                                className="h-12 w-12 rounded-lg object-cover"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold">{product.productName}</p>
                            <p className="text-sm font-bold text-primary">${product.price.toFixed(2)}</p>
                        </div>
                    </div>
                    <Link
                        to={`/products/${product.productId}`}
                        className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-700"
                    >
                        <ShoppingCart className="h-3 w-3" />
                        View Product
                    </Link>
                </div>
            )}
        </div>
    );
}

interface PostDetailViewProps {
    post: FeedPost;
    onLike: () => void;
    onComment: (content: string) => void;
}

export function PostDetailView({ post, onLike, onComment }: PostDetailViewProps) {
    const [commentInput, setCommentInput] = useState("");
    const [savedId, setSavedId] = useState<string | null>(null);
    const [saveBusy, setSaveBusy] = useState(false);

    const [olderComments, setOlderComments] = useState<FeedComment[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(post.commentsCount > (post.comments?.length || 0));
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        setHasMore(post.commentsCount > ((post.comments?.length || 0) + olderComments.length));
    }, [post.commentsCount, post.comments?.length, olderComments.length]);

    const loadMoreComments = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const currentOffset = (post.comments?.length || 0) + olderComments.length;
            const res = await feedApi.getComments(post.id, nextPage, 5, currentOffset);
            const newOlder = [...res.items].reverse();
            setOlderComments((prev) => [...newOlder, ...prev]);
            setPage(nextPage);
            setHasMore(res.pagination ? res.pagination.page * res.pagination.limit < res.pagination.total : false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    };

    const displayComments = [...olderComments, ...[...(post.comments || [])].reverse()];

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            try {
                const id = await savedItemsApi.lookup("POST", post.id);
                if (!cancelled) setSavedId(id);
            } catch {
                if (!cancelled) setSavedId(null);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [post.id]);

    const toggleSave = () => {
        if (saveBusy) return;
        setSaveBusy(true);
        void (async () => {
            try {
                if (savedId) {
                    await savedItemsApi.remove(savedId);
                    setSavedId(null);
                } else {
                    const row = await savedItemsApi.save("POST", post.id);
                    setSavedId(row.id);
                }
            } catch {
                /* ignore */
            } finally {
                setSaveBusy(false);
            }
        })();
    };

    const handleSendComment = () => {
        const trimmed = commentInput.trim();
        if (!trimmed) return;
        onComment(trimmed);
        setCommentInput("");
    };

    const primaryMedia = post.imageUrl;
    const isVideo = post.mediaType === "VIDEO";
    const hasPrimaryMedia = Boolean(primaryMedia);
    const hasProducts = (post.taggedProducts?.length ?? 0) > 0;

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {hasPrimaryMedia ? <div className="lg:col-span-7">
                <div className="group relative aspect-4/5 overflow-hidden rounded-2xl bg-neutral-200 shadow-xl dark:bg-neutral-800">
                    {isVideo ? (
                        <video
                            src={primaryMedia}
                            controls
                            className="h-full w-full object-cover"
                            playsInline
                        />
                    ) : (
                        <img
                            src={primaryMedia}
                            alt="Post"
                            className="h-full w-full object-cover"
                        />
                    )}
                    {post.taggedProducts?.map((product) => (
                        <ShoppableHotspot key={product.id} product={product} />
                    ))}
                    {post.taggedProducts && post.taggedProducts.length > 0 && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow backdrop-blur-sm">
                            <Tag className="h-3 w-3 text-primary" />
                            {post.taggedProducts.length} product(s) tagged
                        </div>
                    )}
                </div>

                {post.taggedProducts && post.taggedProducts.length > 0 && (
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
                                                ${product.price.toFixed(2)}
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
                )}
            </div> : null}

            <div className={cn("flex flex-col gap-4", hasPrimaryMedia ? "lg:col-span-5" : "lg:col-span-12")}>
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                            {post.group ? (
                                <>
                                    <div className="relative h-11 w-11 shrink-0">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                                            {post.group.avatarUrl ? (
                                                <img
                                                    src={post.group.avatarUrl}
                                                    alt={post.group.name}
                                                    className="h-full w-full rounded-lg object-cover"
                                                />
                                            ) : (
                                                post.group.name.slice(0, 2).toUpperCase()
                                            )}
                                        </div>
                                        <Avatar
                                            src={post.author.avatarUrl}
                                            alt={post.author.fullName}
                                            wrapperClassName="absolute -bottom-1 -right-1 h-6 w-6 border-2 border-white dark:border-neutral-900"
                                        />
                                    </div>
                                    <div>
                                        <Link
                                            to={`/groups/${post.group.id}`}
                                            className="block font-semibold text-neutral-900 hover:text-primary hover:underline dark:text-neutral-100"
                                        >
                                            {post.group.name}
                                        </Link>
                                        <p className="text-xs text-neutral-500">
                                            <Link
                                                to={`/profile/${post.author.id}`}
                                                className="font-medium text-neutral-700 hover:text-primary hover:underline dark:text-neutral-300"
                                            >
                                                {post.author.fullName ??
                                                    post.author.username ??
                                                    "User"}
                                            </Link>
                                            {post.author.username &&
                                            post.author.fullName &&
                                            post.author.username !== post.author.fullName
                                                ? ` · @${post.author.username}`
                                                : ""}
                                        </p>
                                        <p className="text-xs text-neutral-500">
                                            {formatTimeAgo(post.createdAt)}
                                            {post.location ? ` · ${post.location}` : ""}
                                        </p>
                                        {post.feeling ? (
                                            <p className="mt-0.5 text-xs font-medium text-primary">
                                                {post.feeling}
                                            </p>
                                        ) : null}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Avatar
                                        src={post.author.avatarUrl}
                                        alt={post.author.fullName}
                                    />
                                    <div>
                                        <Link
                                            to={`/profile/${post.author.id}`}
                                            className="font-semibold text-neutral-900 hover:text-primary hover:underline dark:text-neutral-100"
                                        >
                                            {post.author.fullName ??
                                                post.author.username ??
                                                "User"}
                                        </Link>
                                        <p className="text-xs text-neutral-500">
                                            {formatTimeAgo(post.createdAt)}
                                            {post.location ? ` · ${post.location}` : ""}
                                        </p>
                                        {post.feeling ? (
                                            <p className="mt-0.5 text-xs font-medium text-primary">
                                                {post.feeling}
                                            </p>
                                        ) : null}
                                    </div>
                                </>
                            )}
                        </div>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="p-4">
                        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                            {post.content}
                        </p>
                        {post.taggedUsers && post.taggedUsers.length > 0 ? (
                            <p className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
                                <span className="font-semibold">With </span>
                                {post.taggedUsers.map((u, i) => (
                                    <span key={u.id}>
                                        {i > 0 ? ", " : ""}
                                        <Link
                                            to={`/profile/${u.id}`}
                                            className="font-medium text-primary hover:underline"
                                        >
                                            {u.fullName ?? u.username ?? "User"}
                                        </Link>
                                    </span>
                                ))}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onLike}
                                className={cn(
                                    "flex items-center gap-1.5 text-sm transition-colors hover:text-primary",
                                    post.likedByMe
                                        ? "font-semibold text-primary"
                                        : "text-neutral-600 dark:text-neutral-400",
                                )}
                            >
                                <Heart className={cn("h-5 w-5", post.likedByMe && "fill-current")} />
                                <span className="text-xs font-semibold">{post.likesCount}</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-primary dark:text-neutral-400"
                            >
                                <MessageCircle className="h-5 w-5" />
                                <span className="text-xs font-semibold">{post.commentsCount}</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-primary dark:text-neutral-400"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                disabled={saveBusy}
                                onClick={toggleSave}
                                aria-label={savedId ? "Remove from saved" : "Save post"}
                                aria-pressed={!!savedId}
                                className={cn(
                                    "flex items-center gap-1.5 text-sm transition-colors hover:text-primary disabled:opacity-60",
                                    savedId
                                        ? "font-semibold text-primary"
                                        : "text-neutral-600 dark:text-neutral-400",
                                )}
                            >
                                <Bookmark className={cn("h-4 w-4", savedId && "fill-current")} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasProducts ? (
                                <button
                                    type="button"
                                    className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white transition-all hover:bg-primary-700"
                                >
                                    Buy Now
                                </button>
                            ) : post.linkUrl ? (
                                <a
                                    href={post.linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg border border-primary px-4 py-2 text-xs font-bold text-primary transition-all hover:bg-primary/5"
                                >
                                    Learn More
                                </a>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="flex min-h-96 flex-1 flex-col overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-100 p-4 shrink-0 dark:border-neutral-800">
                        <h3 className="font-bold">Comments ({post.commentsCount})</h3>
                    </div>
                    <div
                        className={cn(
                            "min-h-64 flex-1 overflow-y-auto p-4",
                            displayComments.length > 0 || hasMore
                                ? "space-y-4"
                                : "flex items-center justify-center",
                        )}
                    >
                        {hasMore && (
                            <div className="flex justify-center pb-2">
                                <button
                                    type="button"
                                    onClick={loadMoreComments}
                                    disabled={loadingMore}
                                    className="text-sm font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                                >
                                    {loadingMore ? "Loading..." : "View more comments"}
                                </button>
                            </div>
                        )}
                        {displayComments.length > 0 ? (
                            displayComments.map((comment: FeedComment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <Avatar
                                        src={comment.user?.avatarUrl}
                                        alt={comment.user?.fullName}
                                        wrapperClassName="h-8 w-8 shrink-0"
                                    />
                                    <div className="rounded-2xl bg-neutral-100 px-3 py-2 text-sm dark:bg-neutral-800">
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                {comment.user?.fullName ?? comment.user?.username ?? "User"}
                                            </p>
                                            <span className="text-xs text-neutral-500 shrink-0">
                                                {comment.createdAt ? formatTimeAgo(comment.createdAt) : ""}
                                            </span>
                                        </div>
                                        <p className="mt-0.5 text-neutral-800 dark:text-neutral-200">
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-sm text-neutral-400">
                                No comments yet. Be the first!
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-3 border-t border-neutral-100 p-4 shrink-0 dark:border-neutral-800">
                        <input
                            type="text"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSendComment();
                            }}
                            placeholder="Add a comment..."
                            className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800"
                        />
                        <Button size="icon" onClick={handleSendComment} disabled={!commentInput.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
