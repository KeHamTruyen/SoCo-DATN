import {
    ChevronDown,
    Edit3,
    Globe,
    Image,
    Sparkles,
    Tag,
    UserPlus,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { groupApi } from "../features/group/api/groupApi";
import type { Group } from "../features/group/types/group.types";
import { cn } from "../shared/lib/cn";
import { Button, UnifiedHeader } from "../shared/ui";

type GroupTab = "discussion" | "members" | "products" | "media";

const TABS: { value: GroupTab; label: string }[] = [
    { value: "discussion", label: "Discussion" },
    { value: "members", label: "Members" },
    { value: "products", label: "Group Products" },
    { value: "media", label: "Media" },
];

export default function GroupDetail() {
    const { id } = useParams<{ id: string }>();
    const [group, setGroup] = useState<Group | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<GroupTab>("discussion");
    const [postContent, setPostContent] = useState("");

    useEffect(() => {
        if (!id) return;
        let mounted = true;
        void (async () => {
            setIsLoading(true);
            try {
                const data = await groupApi.getGroup(id);
                if (!mounted) return;
                setGroup(data);
            } catch {
                if (!mounted) return;
            } finally {
                if (mounted) setIsLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [id]);

    const handleToggleMembership = async () => {
        if (!group || !id) return;
        try {
            if (group.isMember) {
                await groupApi.leaveGroup(id);
                setGroup((g) => g ? { ...g, isMember: false, membersCount: g.membersCount - 1 } : g);
            } else {
                await groupApi.joinGroup(id);
                setGroup((g) => g ? { ...g, isMember: true, membersCount: g.membersCount + 1 } : g);
            }
        } catch {
            // silently ignore
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/feed"
            />

            {isLoading ? (
                <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-8">
                    <div className="h-48 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-24 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                </div>
            ) : !group ? (
                <div className="mx-auto max-w-[1440px] px-4 py-8">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
                        Group not found.
                    </div>
                </div>
            ) : (
                <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6">
                    <div className="relative mb-6 rounded-b-2xl bg-white shadow-sm dark:bg-neutral-900">
                        <div className="h-48 overflow-hidden rounded-b-2xl bg-neutral-200 dark:bg-neutral-800 sm:h-64">
                            {group.coverImageUrl && (
                                <img
                                    src={group.coverImageUrl}
                                    alt={group.name}
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                        <div className="flex flex-col gap-4 px-6 pb-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex flex-1 gap-4 pb-2">
                                <h1 className="text-3xl font-bold">{group.name}</h1>
                                <div className="flex items-center gap-3 mt-1 text-sm font-medium text-neutral-500">
                                    <span className="flex items-center gap-1">
                                        <Globe className="h-4 w-4" />
                                        {group.privacy === "public" ? "Public Group" : "Private Group"}
                                    </span>
                                    <span className="h-1 w-1 rounded-full bg-neutral-300" />
                                    <span>{group.membersCount.toLocaleString()} Members</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pb-2">
                                {group.isMember ? (
                                    <Button
                                        variant="outline"
                                        className="gap-2"
                                        onClick={() => void handleToggleMembership()}
                                    >
                                        Joined <ChevronDown className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        className="gap-2"
                                        onClick={() => void handleToggleMembership()}
                                    >
                                        <Users className="h-4 w-4" />
                                        Join Group
                                    </Button>
                                )}
                                <Button variant="outline" className="gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Invite
                                </Button>
                                <Button className="gap-2">
                                    <Edit3 className="h-4 w-4" />
                                    Write Post
                                </Button>
                            </div>
                        </div>

                        <div className="flex gap-8 border-t border-neutral-100 px-6 pt-4 dark:border-neutral-800">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.value}
                                    type="button"
                                    onClick={() => setActiveTab(tab.value)}
                                    className={cn(
                                        "relative pb-4 text-sm font-semibold transition-colors",
                                        activeTab === tab.value
                                            ? "text-primary"
                                            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white",
                                    )}
                                >
                                    {tab.label}
                                    {activeTab === tab.value && (
                                        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 pb-8 lg:grid-cols-4">
                        <div className="space-y-6 lg:col-span-3">
                            {activeTab === "discussion" && (
                                <>
                                    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                        <div className="flex gap-4">
                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800" />
                                            <textarea
                                                value={postContent}
                                                onChange={(e) => setPostContent(e.target.value)}
                                                placeholder="Share something with the group..."
                                                className="w-full min-h-[80px] resize-none rounded-xl border-none bg-neutral-100 p-3 text-sm outline-none focus:ring-1 focus:ring-primary/30 dark:bg-neutral-800"
                                            />
                                        </div>
                                        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                                >
                                                    <Image className="h-4 w-4 text-primary" />
                                                    Photo/Video
                                                </button>
                                                <button
                                                    type="button"
                                                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                                                >
                                                    <Tag className="h-4 w-4 text-primary" />
                                                    Tag Product
                                                </button>
                                            </div>
                                            <button
                                                type="button"
                                                className="flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary-100 dark:bg-primary-950/30 dark:text-primary"
                                            >
                                                <Sparkles className="h-3.5 w-3.5" />
                                                AI Assistant
                                            </button>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
                                        No posts yet. Start the discussion!
                                    </div>
                                </>
                            )}
                            {activeTab !== "discussion" && (
                                <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
                                    {TABS.find((t) => t.value === activeTab)?.label} content coming soon.
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                                <h3 className="mb-3 font-bold">About Group</h3>
                                {group.description && (
                                    <p className="text-sm text-neutral-500">{group.description}</p>
                                )}
                                <div className="mt-3 space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-neutral-500">
                                        <Users className="h-4 w-4" />
                                        {group.membersCount.toLocaleString()} members
                                    </div>
                                    <div className="flex items-center gap-2 text-neutral-500">
                                        <Globe className="h-4 w-4" />
                                        {group.privacy === "public" ? "Public" : "Private"} group
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
