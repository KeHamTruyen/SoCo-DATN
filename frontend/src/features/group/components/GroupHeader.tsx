import { Check, ChevronDown, Globe, Link2, Lock, LogOut, Settings, Users } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useGroupContext } from "../context/GroupContext";
import { copyToClipboard, getAvatarColor, getGradient, getInitials } from "../utils/groupDetailUtils";
import { cn } from "../../../shared/lib/cn";
import { GROUP_TABS } from "../hooks/useGroupTabs";

export function GroupHeader() {
    const { 
        id, group, isLeaving, leaveError, setLeaveError, 
        handleJoinGroup, handleLeaveGroup, 
        activeTab, setActiveTab, setShowUpdateModal 
    } = useGroupContext();

    const [inviteCopied, setInviteCopied] = useState(false);
    const [membershipMenuOpen, setMembershipMenuOpen] = useState(false);
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const membershipMenuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!membershipMenuOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (!membershipMenuRef.current?.contains(event.target as Node)) {
                setMembershipMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [membershipMenuOpen]);

    if (!group) return null;

    const isPublic = group.privacy?.toUpperCase() === "PUBLIC";
    const isAdmin = group.memberRole === "ADMIN";
    const avatarColor = getAvatarColor(group.name);
    const gradient = getGradient(group.name);

    const handleInvite = () => {
        const link = `${window.location.origin}/groups/${id}`;
        void copyToClipboard(link).then(() => {
            setInviteCopied(true);
            setTimeout(() => setInviteCopied(false), 2000);
        });
    };

    return (
        <div className="mb-6 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            {/* Cover image */}
            <div className="relative h-56 w-full sm:h-64">
                {group.coverImageUrl ? (
                    <img src={group.coverImageUrl} alt={group.name} className="h-full w-full object-cover" />
                ) : (
                    <div className={cn("h-full w-full bg-linear-to-br", gradient)} />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
            </div>

            {/* Info + actions */}
            <div className="px-6 pb-0">
                <div className="relative z-10 -mt-12 flex flex-col gap-6 md:flex-row md:items-end">
                    {/* Group avatar */}
                    {group.avatarUrl ? (
                        <img src={group.avatarUrl} alt={group.name} className="h-32 w-32 shrink-0 rounded-xl border-4 border-white object-cover shadow-lg dark:border-neutral-900" />
                    ) : (
                        <div className={cn("flex h-32 w-32 shrink-0 items-center justify-center rounded-xl border-4 border-white text-3xl font-bold text-white shadow-lg dark:border-neutral-900", avatarColor)}>
                            {getInitials(group.name)}
                        </div>
                    )}

                    {/* Name + meta + buttons */}
                    <div className="flex flex-1 flex-col gap-1 pb-2 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">{group.name}</h1>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                <span className="flex items-center gap-1">
                                    {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                    {isPublic ? "Public Group" : "Private Group"}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                                <span>{group.membersCount.toLocaleString()} Members</span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                            {group.isMember ? (
                                <>
                                    <div className="relative" ref={membershipMenuRef}>
                                        <button type="button" onClick={() => setMembershipMenuOpen((prev) => !prev)} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-semibold transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                                            Joined
                                            <ChevronDown className={cn("h-4 w-4 transition-transform", membershipMenuOpen && "rotate-180")} />
                                        </button>
                                        {membershipMenuOpen && (
                                            <div className="absolute right-0 top-full z-10 mt-2 w-40 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                                                <button type="button" onClick={() => { setMembershipMenuOpen(false); setLeaveError(null); setLeaveConfirmOpen(true); }} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10">
                                                    <LogOut className="h-4 w-4" />
                                                    Leave group
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <button type="button" onClick={handleInvite} className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2 text-sm font-semibold transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700">
                                        {inviteCopied ? <><Check className="h-4 w-4 text-green-500" /> Copied!</> : <><Link2 className="h-4 w-4" /> Invite</>}
                                    </button>
                                    {isAdmin && (
                                        <button type="button" onClick={() => setShowUpdateModal(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90">
                                            <Settings className="h-4 w-4" />
                                            Settings
                                        </button>
                                    )}
                                </>
                            ) : (
                                <button type="button" onClick={() => void handleJoinGroup()} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90">
                                    <Users className="h-4 w-4" />
                                    Join Group
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {leaveError && <p className="mt-4 text-sm text-red-500">{leaveError}</p>}
                
                {leaveConfirmOpen && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-900/20">
                        <p className="text-sm font-semibold text-red-600 dark:text-red-400">Are you sure you want to leave this group?</p>
                        <div className="mt-3 flex gap-2">
                            <button type="button" disabled={isLeaving} onClick={() => void handleLeaveGroup().then((ok) => { if (ok) setLeaveConfirmOpen(false); })} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50">
                                {isLeaving ? "Leaving..." : "Leave Group"}
                            </button>
                            <button type="button" disabled={isLeaving} onClick={() => setLeaveConfirmOpen(false)} className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="mt-6 flex gap-8 border-t border-neutral-100 pt-1 dark:border-neutral-800">
                    {GROUP_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setActiveTab(tab.value)}
                            className={cn(
                                "relative pb-4 text-sm font-semibold transition-colors",
                                activeTab === tab.value ? "text-primary" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                            )}
                        >
                            {tab.label}
                            {activeTab === tab.value && (
                                <div className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
