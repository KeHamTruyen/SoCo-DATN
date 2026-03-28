import { Camera, Loader2, Shield, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { groupApi } from "../api/groupApi";
import type { Group, GroupMemberBrief } from "../types/group.types";
import { uploadApi } from "../../upload/api/uploadApi";
import { Avatar, Button } from "../../../shared/ui";

interface UpdateGroupModalProps {
    group: Group;
    onClose: () => void;
    onUpdated: (group: Group) => void;
}

const MAX_ADMINS = 20;

export function UpdateGroupModal({ group, onClose, onUpdated }: UpdateGroupModalProps) {
    const [name, setName] = useState(group.name);
    const [description, setDescription] = useState(group.description ?? "");
    const [privacy, setPrivacy] = useState(group.privacy?.toUpperCase() ?? "PUBLIC");
    const [avatarUrl, setAvatarUrl] = useState(group.avatarUrl ?? "");
    const [coverImageUrl, setCoverImageUrl] = useState(group.coverImageUrl ?? "");
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);

    // Admin management
    const [members, setMembers] = useState<GroupMemberBrief[]>([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [tab, setTab] = useState<"info" | "admins">("info");

    useEffect(() => {
        if (tab !== "admins") return;
        let mounted = true;
        void (async () => {
            setLoadingMembers(true);
            try {
                const res = await groupApi.getGroupMembers(group.id, 1, 100);
                if (!mounted) return;
                // res format: { success, data: GroupMemberBrief[], pagination }
                const rawData = ((res as unknown) as { data?: GroupMemberBrief[] }).data ?? [];
                setMembers(rawData);
            } catch {
                // ignore
            } finally {
                if (mounted) setLoadingMembers(false);
            }
        })();
        return () => { mounted = false; };
    }, [tab, group.id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updated = await groupApi.updateGroup(group.id, {
                name: name.trim(),
                description: description.trim(),
                privacy,
                avatarUrl: avatarUrl || undefined,
                coverImageUrl: coverImageUrl || undefined,
            });
            onUpdated(updated);
        } catch {
            // show error toast in future
        } finally {
            setSaving(false);
        }
    };

    const handleUploadAvatar = async (files: FileList | null) => {
        if (!files?.length) return;
        setUploadingAvatar(true);
        try {
            const { url } = await uploadApi.uploadPostMedia(files[0]);
            setAvatarUrl(url);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleUploadCover = async (files: FileList | null) => {
        if (!files?.length) return;
        setUploadingCover(true);
        try {
            const { url } = await uploadApi.uploadPostMedia(files[0]);
            setCoverImageUrl(url);
        } finally {
            setUploadingCover(false);
        }
    };

    const adminCount = members.filter((m) => m.role === "ADMIN").length;

    const handlePromoteToAdmin = async (userId: string) => {
        if (adminCount >= MAX_ADMINS) return;
        try {
            await groupApi.updateMemberRole(group.id, userId, "ADMIN");
            setMembers((prev) =>
                prev.map((m) => (m.userId === userId ? { ...m, role: "ADMIN" } : m)),
            );
        } catch { /* ignore */ }
    };

    const handleDemoteAdmin = async (userId: string) => {
        if (userId === group.createdBy) return; // can't demote founder
        try {
            await groupApi.updateMemberRole(group.id, userId, "MEMBER");
            setMembers((prev) =>
                prev.map((m) => (m.userId === userId ? { ...m, role: "MEMBER" } : m)),
            );
        } catch { /* ignore */ }
    };

    const handleRemoveMember = async (userId: string) => {
        if (userId === group.createdBy) return;
        try {
            await groupApi.removeMember(group.id, userId);
            setMembers((prev) => prev.filter((m) => m.userId !== userId));
        } catch { /* ignore */ }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 sm:rounded-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold">Group Settings</h2>
                    <div className="w-9" /> {/* spacer */}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-200 dark:border-neutral-800">
                    <button
                        type="button"
                        onClick={() => setTab("info")}
                        className={`flex-1 py-3 text-sm font-semibold ${tab === "info" ? "border-b-2 border-primary text-primary" : "text-neutral-500"}`}
                    >
                        Group Info
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab("admins")}
                        className={`flex-1 py-3 text-sm font-semibold ${tab === "admins" ? "border-b-2 border-primary text-primary" : "text-neutral-500"}`}
                    >
                        Members & Admins
                    </button>
                </div>

                <div className="overflow-y-auto px-4 py-4">
                    {tab === "info" ? (
                        <div className="space-y-4">
                            {/* Cover upload */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-neutral-500">Cover Image</label>
                                <div className="relative h-32 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    {coverImageUrl && (
                                        <img src={coverImageUrl} alt="" className="h-full w-full object-cover" />
                                    )}
                                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => void handleUploadCover(e.target.files)}
                                        />
                                        {uploadingCover ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Camera className="h-6 w-6 text-white" />}
                                    </label>
                                </div>
                            </div>

                            {/* Avatar upload */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-neutral-500">Avatar</label>
                                <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary text-2xl font-bold text-white">
                                            {name.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => void handleUploadAvatar(e.target.files)}
                                        />
                                        {uploadingAvatar ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Camera className="h-5 w-5 text-white" />}
                                    </label>
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-neutral-500">Name</label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-neutral-500">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full resize-none rounded-lg border border-neutral-200 bg-white p-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                />
                            </div>

                            {/* Privacy */}
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-neutral-500">Privacy</label>
                                <select
                                    value={privacy}
                                    onChange={(e) => setPrivacy(e.target.value)}
                                    className="h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800"
                                >
                                    <option value="PUBLIC">Public</option>
                                    <option value="PRIVATE">Private</option>
                                </select>
                            </div>

                            <Button
                                onClick={() => void handleSave()}
                                disabled={saving || !name.trim()}
                                className="w-full"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {loadingMembers ? (
                                <p className="text-sm text-neutral-400">Loading members...</p>
                            ) : (
                                <>
                                    <p className="text-xs text-neutral-400">
                                        {adminCount} / {MAX_ADMINS} admins • Only existing members can be promoted
                                    </p>
                                    {members.map((m) => (
                                        <div key={m.userId} className="flex items-center justify-between rounded-lg p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    src={m.user.avatarUrl}
                                                    alt={m.user.fullName ?? m.user.username ?? "Member"}
                                                    wrapperClassName="h-9 w-9 shrink-0"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {m.user.fullName ?? m.user.username ?? "Member"}
                                                    </p>
                                                    <p className="text-[10px] font-bold uppercase tracking-tighter text-neutral-400">
                                                        {m.role}
                                                        {m.userId === group.createdBy ? " • Founder" : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {m.role === "ADMIN" ? (
                                                    m.userId !== group.createdBy && (
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleDemoteAdmin(m.userId)}
                                                            className="rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-700"
                                                            title="Demote to member"
                                                        >
                                                            Demote
                                                        </button>
                                                    )
                                                ) : (
                                                    <>
                                                        <button
                                                            type="button"
                                                            disabled={adminCount >= MAX_ADMINS}
                                                            onClick={() => void handlePromoteToAdmin(m.userId)}
                                                            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-40"
                                                            title="Promote to admin"
                                                        >
                                                            <Shield className="h-3 w-3" />
                                                            Admin
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => void handleRemoveMember(m.userId)}
                                                            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                                                            title="Remove member"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
