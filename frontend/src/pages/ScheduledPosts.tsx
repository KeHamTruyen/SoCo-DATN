import { BarChart2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { feedApi } from "../features/feed/api/feedApi";
import { CreatePostModal } from "../features/feed/components/CreatePostModal";
import { ScheduledPostsList } from "../features/feed/components/ScheduledPostsList";
import type { CreatePostPayload, FeedPost } from "../features/feed/types/feed.types";
import { Button, UnifiedHeader } from "../shared/ui";
import { stripHtmlToPlain } from "../shared/tiptap/postHtmlUtils";

type ScheduledBucket = "scheduled" | "published";

interface ScheduledSectionState {
    items: FeedPost[];
    total: number;
    page: number;
    hasMore: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
}

interface DeleteConfirmationState {
    post: FeedPost;
    isSubmitting: boolean;
}

const PAGE_SIZE = 5;

const EMPTY_SECTION: ScheduledSectionState = {
    items: [],
    total: 0,
    page: 1,
    hasMore: false,
    isLoading: true,
    isLoadingMore: false,
};

export default function ScheduledPosts() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [editingPost, setEditingPost] = useState<FeedPost | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState | null>(
        null,
    );
    const [upcoming, setUpcoming] = useState<ScheduledSectionState>(EMPTY_SECTION);
    const [published, setPublished] = useState<ScheduledSectionState>(EMPTY_SECTION);

    const getSectionState = (bucket: ScheduledBucket) =>
        bucket === "scheduled" ? upcoming : published;

    const setSectionState = (
        bucket: ScheduledBucket,
        updater: (prev: ScheduledSectionState) => ScheduledSectionState,
    ) => {
        if (bucket === "scheduled") {
            setUpcoming(updater);
            return;
        }
        setPublished(updater);
    };

    const loadSection = async (
        bucket: ScheduledBucket,
        options?: { page?: number; append?: boolean; limit?: number },
    ) => {
        const page = options?.page ?? 1;
        const append = options?.append ?? false;
        const limit = options?.limit ?? PAGE_SIZE;
        setSectionState(bucket, (prev) => ({
            ...prev,
            isLoading: !append,
            isLoadingMore: append,
        }));
        try {
            const data = await feedApi.listScheduledPosts({
                status: bucket,
                page,
                limit,
            });
            setSectionState(bucket, (prev) => ({
                items: append ? [...prev.items, ...data.items] : data.items,
                total: data.total,
                page,
                hasMore: data.hasMore,
                isLoading: false,
                isLoadingMore: false,
            }));
        } catch {
            setSectionState(bucket, (prev) => ({
                ...prev,
                items: append ? prev.items : [],
                total: append ? prev.total : 0,
                hasMore: false,
                isLoading: false,
                isLoadingMore: false,
            }));
        }
    };

    const refreshSection = async (bucket: ScheduledBucket, visibleCount?: number) => {
        const count = visibleCount ?? Math.max(getSectionState(bucket).items.length, PAGE_SIZE);
        await loadSection(bucket, { page: 1, limit: count });
    };

    useEffect(() => {
        void Promise.all([loadSection("scheduled"), loadSection("published")]);
    }, []);

    const handleCreate = async (payload: CreatePostPayload) => {
        if (!payload.scheduledAt) {
            return;
        }
        await feedApi.createScheduledPost(payload);
        setShowModal(false);
        await refreshSection("scheduled");
    };

    const handleUpdate = async (payload: CreatePostPayload) => {
        if (!editingPost) {
            return;
        }
        const bucket = editingPost.scheduledStatus === "published" ? "published" : "scheduled";
        await feedApi.updateScheduledPost(editingPost.id, payload);
        setEditingPost(null);
        await refreshSection(bucket);
    };

    const handleDelete = async () => {
        const post = deleteConfirmation?.post;
        if (!post) {
            return;
        }

        setDeleteConfirmation((prev) => (prev ? { ...prev, isSubmitting: true } : prev));
        const bucket = post.scheduledStatus === "published" ? "published" : "scheduled";
        const current = getSectionState(bucket);
        try {
            await feedApi.deleteScheduledPost(post.id);
            setDeleteConfirmation(null);
            await refreshSection(bucket, Math.max(PAGE_SIZE, current.items.length - 1));
        } finally {
            setDeleteConfirmation((prev) =>
                prev ? { ...prev, isSubmitting: false } : prev,
            );
        }
    };

    const handleLoadMore = async (bucket: ScheduledBucket) => {
        const current = getSectionState(bucket);
        if (!current.hasMore || current.isLoadingMore) {
            return;
        }
        await loadSection(bucket, { page: current.page + 1, append: true, limit: PAGE_SIZE });
    };

    const handlePostClick = (post: FeedPost) => {
        if (post.scheduledStatus === "published" && post.publishedPostId) {
            navigate(`/post/${post.publishedPostId}`);
            return;
        }
        setEditingPost(post);
    };

    const upcomingThisWeek = upcoming.items.filter((post) => {
        if (!post.scheduledAt) return false;
        const scheduledDate = new Date(post.scheduledAt);
        const now = new Date();
        const weekMs = 7 * 24 * 60 * 60 * 1000;
        const diff = scheduledDate.getTime() - now.getTime();
        return diff >= 0 && diff < weekMs;
    }).length;

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/feed"
            />
            <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 p-4 lg:p-8">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Scheduled Posts{" "}
                            <span className="ml-2 text-lg font-normal text-neutral-400">
                                ({upcoming.total})
                            </span>
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Manage your upcoming product releases and social updates.
                        </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 md:mt-0">
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => navigate("/scheduled-posts/analytics")}
                        >
                            <BarChart2 className="h-4 w-4" />
                            View Analytics
                        </Button>
                        <Button onClick={() => setShowModal(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            New Post
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="space-y-4 lg:col-span-2">
                        <ScheduledPostsList
                            sectionTitle="Upcoming Posts"
                            posts={upcoming.items}
                            isLoading={upcoming.isLoading}
                            emptyTitle="No upcoming posts yet."
                            emptyDescription="Create a post and schedule it for a future date."
                            badgeLabel="Upcoming"
                            dateLabel="Scheduled for"
                            onPostClick={handlePostClick}
                            onEdit={(post) => setEditingPost(post)}
                            onDelete={(post) =>
                                setDeleteConfirmation({ post, isSubmitting: false })
                            }
                            hasMore={upcoming.hasMore}
                            isLoadingMore={upcoming.isLoadingMore}
                            onLoadMore={() => void handleLoadMore("scheduled")}
                        />
                        <ScheduledPostsList
                            sectionTitle="Published Posts"
                            posts={published.items}
                            isLoading={published.isLoading}
                            emptyTitle="No published scheduled posts yet."
                            emptyDescription="Published posts from your schedule will appear here."
                            badgeLabel="Published"
                            dateLabel="Published on"
                            onPostClick={handlePostClick}
                            onEdit={(post) => setEditingPost(post)}
                            onDelete={(post) =>
                                setDeleteConfirmation({ post, isSubmitting: false })
                            }
                            hasMore={published.hasMore}
                            isLoadingMore={published.isLoadingMore}
                            onLoadMore={() => void handleLoadMore("published")}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <h3 className="mb-3 font-semibold">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-500">Upcoming Posts</span>
                                    <span className="font-bold text-primary">{upcoming.total}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-500">Published Posts</span>
                                    <span className="font-bold">{published.total}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-500">This Week</span>
                                    <span className="font-bold">{upcomingThisWeek}</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
                            <h3 className="mb-2 font-semibold text-primary">Tips</h3>
                            <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <li>• Post consistently for better reach</li>
                                <li>• Tag products to drive sales</li>
                                <li>• Schedule during peak hours (6-9 PM)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {showModal ? (
                <CreatePostModal
                    defaultScheduleMode
                    onClose={() => setShowModal(false)}
                    onCreate={(payload) => void handleCreate(payload)}
                />
            ) : null}

            {editingPost ? (
                <CreatePostModal
                    key={editingPost.id}
                    onClose={() => setEditingPost(null)}
                    onCreate={(payload) => void handleUpdate(payload)}
                    defaultScheduleMode={editingPost.scheduledStatus !== "published"}
                    hideScheduleOption={editingPost.scheduledStatus === "published"}
                    title="Edit Post"
                    submitLabel="Save Changes"
                    initialValues={{
                        content: editingPost.content,
                        visibility: editingPost.visibility,
                        mediaUrls: editingPost.mediaUrls,
                        mediaType: editingPost.mediaType ?? undefined,
                        productTags: editingPost.taggedProducts?.map((tag) => ({
                            productId: tag.productId,
                            anchorType: tag.anchorType,
                            positionX: tag.positionX,
                            positionY: tag.positionY,
                            blockId: tag.blockId,
                            startOffset: tag.startOffset,
                            endOffset: tag.endOffset,
                            sortOrder: tag.sortOrder,
                        })),
                        productLabel: editingPost.taggedProducts?.[0]?.productName ?? null,
                        location: editingPost.location ?? null,
                        feeling: editingPost.feeling ?? null,
                        taggedUsers: editingPost.taggedUsers ?? [],
                        taggedUserIds: editingPost.taggedUsers?.map((user) => user.id) ?? [],
                        scheduledAt:
                            editingPost.scheduledStatus === "published"
                                ? undefined
                                : editingPost.scheduledAt,
                    }}
                />
            ) : null}

            {deleteConfirmation ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
                        <div className="border-b border-neutral-100 p-6 dark:border-neutral-800">
                            <h2 className="text-lg font-semibold">Delete post?</h2>
                            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                                This will permanently remove the post and its media from Cloudinary.
                            </p>
                        </div>
                        <div className="p-6">
                            <p className="line-clamp-3 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                {stripHtmlToPlain(deleteConfirmation.post.content) ||
                                    "This post has no caption."}
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-3 border-t border-neutral-100 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-800/30">
                            <Button
                                variant="ghost"
                                onClick={() => setDeleteConfirmation(null)}
                                disabled={deleteConfirmation.isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => void handleDelete()}
                                disabled={deleteConfirmation.isSubmitting}
                            >
                                {deleteConfirmation.isSubmitting ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
