import {
    Bookmark,
    Heart,
    MessageCircle,
    MoreHorizontal,
    Send,
    ShoppingCart,
    Tag,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../../shared/ui/atoms/avatar";
import { Button } from "../../../shared/ui/atoms/button";
import { cn } from "../../../shared/lib/cn";
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

    const handleSendComment = () => {
        const trimmed = commentInput.trim();
        if (!trimmed) return;
        onComment(trimmed);
        setCommentInput("");
    };

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
                <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-200 shadow-xl dark:bg-neutral-800">
                    {post.imageUrl ? (
                        <img
                            src={post.imageUrl}
                            alt="Post"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-400">
                            No image
                        </div>
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
            </div>

            <div className="flex flex-col gap-4 lg:col-span-5">
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex items-center justify-between border-b border-neutral-100 p-4 dark:border-neutral-800">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={post.author.avatarUrl ?? ""}
                                alt={post.author.fullName}
                            />
                            <div>
                                <p className="font-semibold">{post.author.fullName}</p>
                                <p className="text-xs text-neutral-500">
                                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="p-4">
                        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                            {post.content}
                        </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                onClick={onLike}
                                className={cn(
                                    "flex items-center gap-1.5 text-sm font-medium transition-colors",
                                    post.likedByMe ? "text-destructive" : "text-neutral-500 hover:text-destructive",
                                )}
                            >
                                <Heart
                                    className={cn("h-5 w-5", post.likedByMe && "fill-current")}
                                />
                                {post.likesCount}
                            </button>
                            <span className="flex items-center gap-1.5 text-sm font-medium text-neutral-500">
                                <MessageCircle className="h-5 w-5" />
                                {post.commentsCount}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                                <Bookmark className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-neutral-100 p-4 dark:border-neutral-800">
                        <h3 className="font-bold">Comments ({post.commentsCount})</h3>
                    </div>
                    <div className="max-h-80 space-y-4 overflow-y-auto p-4">
                        {post.comments && post.comments.length > 0 ? (
                            post.comments.map((comment: FeedComment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <Avatar
                                        src={comment.author.avatarUrl ?? ""}
                                        alt={comment.author.fullName}
                                        wrapperClassName="h-8 w-8"
                                    />
                                    <div className="flex-1 rounded-xl bg-neutral-50 px-3 py-2 dark:bg-neutral-800">
                                        <p className="text-xs font-semibold">
                                            {comment.author.fullName}
                                        </p>
                                        <p className="mt-0.5 text-sm text-neutral-700 dark:text-neutral-300">
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
                    <div className="flex items-center gap-3 border-t border-neutral-100 p-4 dark:border-neutral-800">
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
