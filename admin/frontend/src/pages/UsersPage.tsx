import { useCallback, useEffect, useState } from "react";
import { adminApi, type AdminUserRow } from "@/api/adminApi";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;
    const [search, setSearch] = useState("");
    const [searchDebounced, setSearchDebounced] = useState("");
    const [role, setRole] = useState("");
    const [isActive, setIsActive] = useState("");
    const [loading, setLoading] = useState(true);
    const [toggleTarget, setToggleTarget] = useState<AdminUserRow | null>(
        null,
    );

    useEffect(() => {
        const t = window.setTimeout(() => setSearchDebounced(search.trim()), 350);
        return () => window.clearTimeout(t);
    }, [search]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await adminApi.getUsers({
                page,
                limit,
                search: searchDebounced || undefined,
                role: role || undefined,
                isActive: isActive || undefined,
            });
            setUsers(data.users);
            setTotal(data.total);
        } catch {
            setUsers([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [page, searchDebounced, role, isActive]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [searchDebounced, role, isActive]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return (
        <div>
            <header className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
                    User Management
                </h2>
                <p className="mt-1 text-muted-foreground">
                    Search, filter, and deactivate accounts (UC4.1)
                </p>
            </header>

            <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground">
                <div className="min-w-[200px] flex-1">
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Search
                    </label>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Name, email, username"
                        className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground"
                    />
                </div>
                <div className="w-40">
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Role
                    </label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground"
                    >
                        <option value="">All</option>
                        <option value="BUYER">Buyer</option>
                        <option value="SELLER">Seller</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </div>
                <div className="w-40">
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                        Active
                    </label>
                    <select
                        value={isActive}
                        onChange={(e) => setIsActive(e.target.value)}
                        className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm text-foreground"
                    >
                        <option value="">All</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-14 animate-pulse rounded-lg bg-muted"
                        />
                    ))}
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border bg-muted/50">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">
                                    User
                                </th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">
                                    Role
                                </th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-foreground">
                                            {u.fullName || u.username}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {u.email}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">{u.role}</td>
                                    <td className="px-4 py-3">
                                        {u.isActive ? (
                                            <span className="text-success">
                                                Active
                                            </span>
                                        ) : (
                                            <span className="text-destructive">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            onClick={() => setToggleTarget(u)}
                                            className="rounded-lg border border-border px-3 py-1 text-xs font-semibold hover:bg-muted"
                                        >
                                            {u.isActive ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex items-center justify-between border-t border-border px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                            Page {page} / {totalPages} — {total} users
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="rounded border border-border px-2 py-1 text-sm text-foreground disabled:opacity-40"
                            >
                                Prev
                            </button>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded border border-border px-2 py-1 text-sm text-foreground disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={Boolean(toggleTarget)}
                title={
                    toggleTarget?.isActive
                        ? "Deactivate account?"
                        : "Activate account?"
                }
                description={
                    toggleTarget
                        ? `Account ${toggleTarget.email} will be ${toggleTarget.isActive ? "deactivated" : "activated"}.`
                        : undefined
                }
                confirmLabel="Confirm"
                variant="danger"
                onClose={() => setToggleTarget(null)}
                onConfirm={async () => {
                    if (!toggleTarget) return;
                    try {
                        await adminApi.toggleUserActive(toggleTarget.id);
                        void load();
                    } catch {
                        /* ignore */
                    }
                }}
            />
        </div>
    );
}
