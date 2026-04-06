import { Image, MessageSquarePlus, Sparkles, Tag } from "lucide-react";
import { useGroupContext } from "../context/GroupContext";
import { useAuthSession } from "../../../shared/auth/useAuthSession";
import { Avatar } from "../../../shared/ui";
import { FeedPostCard } from "../../feed/components/FeedPostCard";

export function GroupDiscussionTab() {
    const { 
        group, posts, postsLoading, setShowPostModal,
        handleLike, handleComment, handleDeletePost
    } = useGroupContext();
    const { user } = useAuthSession();

    if (!group) return null;

    return (
        <>
            {/* Create Post Box — opens CreatePostModal */}
            {group.isMember && (
                <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="flex gap-3">
                        <Avatar
                            src={user?.avatarUrl}
                            alt={user?.fullName ?? "You"}
                            wrapperClassName="h-10 w-10 shrink-0"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPostModal(true)}
                            className="flex-1 rounded-xl bg-neutral-100 px-4 py-2.5 text-left text-sm text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                        >
                            Share something with the group...
                        </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => setShowPostModal(true)}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                                <Image className="h-4 w-4 text-primary" />
                                Photo/Video
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowPostModal(true)}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                                <Tag className="h-4 w-4 text-primary" />
                                Tag Product
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowPostModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary transition-all hover:bg-primary/20"
                        >
                            <Sparkles className="h-4 w-4" />
                            AI Assistant
                        </button>
                    </div>
                </div>
            )}

            {/* Post Feed */}
            {postsLoading ? (
                <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                    Loading posts...
                </div>
            ) : posts.length > 0 ? (
                posts.map((post) => (
                    <FeedPostCard
                        key={post.id}
                        post={{
                            ...post,
                            // Inside group detail, don't show group badge overlay
                            group: undefined,
                        }}
                        onLike={() => void handleLike(post.id)}
                        onComment={(content) => void handleComment(post.id, content)}
                        onDeletePost={async (targetPostId) => {
                            await handleDeletePost(targetPostId);
                        }}
                    />
                ))
            ) : (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-neutral-200 bg-white p-12 text-center dark:border-neutral-700 dark:bg-neutral-900">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <MessageSquarePlus className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-neutral-700 dark:text-neutral-200">
                            Chưa có bài viết nào.
                        </p>
                        <p className="mt-1 text-sm text-neutral-400">
                            Hãy là người đầu tiên chia sẻ điều gì đó với nhóm!
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
