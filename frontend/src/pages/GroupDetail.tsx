import { GuestAuthModal } from "../shared/ui";
import { XCircle } from "lucide-react";
import { GroupProvider, useGroupContext } from "../features/group/context/GroupContext";
import { GroupHeader } from "../features/group/components/GroupHeader";
import { GroupSidebar } from "../features/group/components/GroupSidebar";
import { GroupDiscussionTab } from "../features/group/components/GroupDiscussionTab";
import { GroupMembersTab } from "../features/group/components/GroupMembersTab";
import { GroupMediaTab } from "../features/group/components/GroupMediaTab";
import { GroupProductsTab } from "../features/group/components/GroupProductsTab";
import { CreatePostModal } from "../features/feed/components/CreatePostModal";
import { UpdateGroupModal } from "../features/group/components/UpdateGroupModal";

function GroupDetailInner() {
    const { 
        group, isLoading, activeTab, 
        showPostModal, setShowPostModal, handleCreatePost,
        showUpdateModal, setShowUpdateModal, setGroup,
        showGuestAuthModal, setShowGuestAuthModal,
    } = useGroupContext();

    return (
        <>
            {/* ── Loading skeleton ── */}
            {isLoading ? (
                <div className="mx-auto max-w-360 space-y-6 px-4 py-8 sm:px-6">
                    <div className="h-64 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-24 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                        <div className="space-y-4 lg:col-span-3">
                            <div className="h-40 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                        <div className="h-48 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                </div>
            ) : !group ? (
                /* ── Not found ── */
                <div className="mx-auto max-w-360 px-4 py-8">
                    <div className="flex flex-col items-center gap-4 rounded-xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900/40 dark:bg-red-900/20">
                        <XCircle className="h-12 w-12 text-red-400" />
                        <p className="text-red-600 dark:text-red-400">Không tìm thấy nhóm.</p>
                    </div>
                </div>
            ) : (
                /* ── Main content ── */
                <main className="mx-auto w-full max-w-360 px-4 py-6 sm:px-6">
                    {/* ── Group Header Card ── */}
                    <GroupHeader />

                    {/* ── 2-column layout ── */}
                    <div className="grid grid-cols-1 gap-6 pb-8 lg:grid-cols-4">
                        {/* ── Main column (3/4) ── */}
                        <div className="space-y-6 lg:col-span-3">
                            {activeTab === "discussion" && <GroupDiscussionTab />}
                            {activeTab === "members" && <GroupMembersTab />}
                            {activeTab === "media" && <GroupMediaTab />}
                            {activeTab === "products" && <GroupProductsTab />}
                        </div>

                        {/* ── Sidebar (1/4) ── */}
                        <GroupSidebar />
                    </div>
                </main>
            )}

            {/* Modals */}
            {showPostModal && group?.id && (
                <CreatePostModal
                    onClose={() => setShowPostModal(false)}
                    onCreate={handleCreatePost}
                    groupId={group.id}
                />
            )}
            
            {showUpdateModal && group && (
                <UpdateGroupModal
                    group={group}
                    onClose={() => setShowUpdateModal(false)}
                    onUpdated={(updatedGroup) => {
                        setGroup(updatedGroup);
                        setShowUpdateModal(false);
                    }}
                />
            )}
            <GuestAuthModal
                open={showGuestAuthModal}
                onClose={() => setShowGuestAuthModal(false)}
            />
        </>
    );
}

export default function GroupDetail() {
    return (
        <GroupProvider>
            <GroupDetailInner />
        </GroupProvider>
    );
}
