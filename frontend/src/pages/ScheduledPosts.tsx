import { BarChart2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { feedApi } from "../features/feed/api/feedApi";
import { CreatePostModal } from "../features/feed/components/CreatePostModal";
import { ScheduledPostsList } from "../features/feed/components/ScheduledPostsList";
import type { FeedPost } from "../features/feed/types/feed.types";
import { Button, UnifiedHeader } from "../shared/ui";

export default function ScheduledPosts() {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const load = async () => {
        setIsLoading(true);
        try {
            const data = await feedApi.listScheduledPosts();
            setPosts(data.items);
        } catch {
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const handleCreate = async (content: string, scheduledAt?: string) => {
        await feedApi.createScheduledPost(content, scheduledAt ?? "");
        void load();
    };

    const handleDelete = async (postId: string) => {
        await feedApi.deletePost(postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
    };

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
                                ({posts.length})
                            </span>
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Manage your upcoming product releases and social updates.
                        </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2 md:mt-0">
                        <Button variant="outline" className="gap-2">
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
                        <h2 className="text-lg font-semibold">Upcoming Posts</h2>
                        <ScheduledPostsList
                            posts={posts}
                            isLoading={isLoading}
                            onDelete={(id) => void handleDelete(id)}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                            <h3 className="mb-3 font-semibold">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-500">Total Scheduled</span>
                                    <span className="font-bold text-primary">{posts.length}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3 dark:bg-neutral-800">
                                    <span className="text-sm text-neutral-500">This Week</span>
                                    <span className="font-bold">
                                        {
                                            posts.filter((p) => {
                                                if (!p.scheduledAt) return false;
                                                const d = new Date(p.scheduledAt);
                                                const now = new Date();
                                                const weekMs = 7 * 24 * 60 * 60 * 1000;
                                                return d.getTime() - now.getTime() < weekMs;
                                            }).length
                                        }
                                    </span>
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

            {showModal && (
                <CreatePostModal
                    onClose={() => setShowModal(false)}
                    onCreate={(content, scheduled) => handleCreate(content, scheduled)}
                />
            )}
        </div>
    );
}
