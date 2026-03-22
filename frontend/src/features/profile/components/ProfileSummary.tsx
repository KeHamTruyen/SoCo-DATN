import { Avatar, Badge } from "../../../shared/ui";
import type { UserProfile } from "../../auth/types/auth.types";

interface ProfileSummaryProps {
    user: UserProfile | null;
}

export function ProfileSummary({ user }: ProfileSummaryProps) {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
                <Avatar src={user?.avatarUrl} alt={user?.fullName ?? user?.email ?? "User"} />
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {user?.fullName ?? user?.username ?? "Anonymous User"}
                    </p>
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                        {user?.email ?? "No email"}
                    </p>
                </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">Role</span>
                <Badge>{user?.role ?? "buyer"}</Badge>
            </div>
        </div>
    );
}
