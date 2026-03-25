import { useCallback, useEffect, useState } from "react";
import {
    type AdminCategory,
    type CategoryPayload,
    adminApi,
} from "@/api/adminApi";
import { HttpError } from "@/lib/httpClient";
import { ConfirmDialog } from "@/shared/components/ConfirmDialog";

type Mode = "create" | "edit" | null;

export default function CategoriesPage() {
    const [items, setItems] = useState<AdminCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [includeInactive, setIncludeInactive] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<Mode>(null);
    const [editing, setEditing] = useState<AdminCategory | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<CategoryPayload>({
        name: "",
        slug: "",
        description: "",
        iconUrl: "",
        parentId: null,
        displayOrder: 0,
        isActive: true,
    });
    const [deactivateId, setDeactivateId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminApi.listCategories(includeInactive);
            setItems(data);
        } catch (e) {
            setError(
                e instanceof HttpError ? e.message : "Failed to load categories.",
            );
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [includeInactive]);

    useEffect(() => {
        void load();
    }, [load]);

    function openCreate() {
        setError(null);
        setEditing(null);
        setForm({
            name: "",
            slug: "",
            description: "",
            iconUrl: "",
            parentId: null,
            displayOrder: 0,
            isActive: true,
        });
        setMode("create");
    }

    function openEdit(c: AdminCategory) {
        setError(null);
        setEditing(c);
        setForm({
            name: c.name,
            slug: c.slug,
            description: c.description ?? "",
            iconUrl: c.iconUrl ?? "",
            parentId: c.parentId,
            displayOrder: c.displayOrder,
            isActive: c.isActive,
        });
        setMode("edit");
    }

    function closeModal() {
        if (saving) return;
        setMode(null);
        setEditing(null);
    }

    async function submitForm() {
        const name = form.name?.trim();
        if (!name) {
            setError("Name is required.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            const payload: CategoryPayload = {
                name,
                slug: form.slug?.trim() || undefined,
                description: form.description?.trim() || null,
                iconUrl: form.iconUrl?.trim() || null,
                parentId: form.parentId || null,
                displayOrder: Number(form.displayOrder) || 0,
                isActive: form.isActive,
            };
            if (mode === "create") {
                await adminApi.createCategory(payload);
            } else if (mode === "edit" && editing) {
                await adminApi.updateCategory(editing.id, payload);
            }
            closeModal();
            await load();
        } catch (e) {
            setError(
                e instanceof HttpError ? e.message : "Could not save category.",
            );
        } finally {
            setSaving(false);
        }
    }

    async function confirmDeactivate() {
        if (!deactivateId) return;
        setSaving(true);
        try {
            await adminApi.deactivateCategory(deactivateId);
            setDeactivateId(null);
            await load();
        } catch (e) {
            setError(
                e instanceof HttpError ? e.message : "Could not deactivate.",
            );
        } finally {
            setSaving(false);
        }
    }

    const parentOptions = items.filter((c) => c.id !== editing?.id);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Categories
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage marketplace catalog categories (tree + display
                        order).
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => openCreate()}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                    Add category
                </button>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={includeInactive}
                    onChange={(e) => setIncludeInactive(e.target.checked)}
                />
                Show inactive
            </label>

            {error && !mode ? (
                <p className="text-sm text-destructive">{error}</p>
            ) : null}

            <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-border bg-muted/50">
                        <tr>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Slug</th>
                            <th className="px-4 py-3 font-medium">Parent</th>
                            <th className="px-4 py-3 font-medium">Order</th>
                            <th className="px-4 py-3 font-medium">Products</th>
                            <th className="px-4 py-3 font-medium">Active</th>
                            <th className="px-4 py-3 font-medium text-right">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-8 text-muted-foreground"
                                >
                                    Loading…
                                </td>
                            </tr>
                        ) : items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-8 text-muted-foreground"
                                >
                                    No categories.
                                </td>
                            </tr>
                        ) : (
                            items.map((c) => (
                                <tr
                                    key={c.id}
                                    className="border-b border-border last:border-0"
                                >
                                    <td className="px-4 py-2 font-medium">
                                        {c.parent ? (
                                            <span className="text-muted-foreground">
                                                —{" "}
                                            </span>
                                        ) : null}
                                        {c.name}
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground">
                                        {c.slug}
                                    </td>
                                    <td className="px-4 py-2">
                                        {c.parent?.name ?? "—"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {c.displayOrder}
                                    </td>
                                    <td className="px-4 py-2">
                                        {c._count?.products ?? 0}
                                    </td>
                                    <td className="px-4 py-2">
                                        {c.isActive ? "Yes" : "No"}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button
                                            type="button"
                                            className="mr-2 text-primary hover:underline"
                                            onClick={() => openEdit(c)}
                                        >
                                            Edit
                                        </button>
                                        {c.isActive ? (
                                            <button
                                                type="button"
                                                className="text-destructive hover:underline"
                                                onClick={() =>
                                                    setDeactivateId(c.id)
                                                }
                                            >
                                                Deactivate
                                            </button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {mode ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    role="presentation"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl"
                    >
                        <h2 className="text-lg font-bold">
                            {mode === "create"
                                ? "New category"
                                : "Edit category"}
                        </h2>
                        {error ? (
                            <p className="mt-2 text-sm text-destructive">
                                {error}
                            </p>
                        ) : null}
                        <div className="mt-4 space-y-3">
                            <label className="block text-sm font-medium">
                                Name *
                                <input
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            name: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </label>
                            <label className="block text-sm font-medium">
                                Slug (optional)
                                <input
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    value={form.slug ?? ""}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            slug: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </label>
                            <label className="block text-sm font-medium">
                                Parent
                                <select
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    value={form.parentId ?? ""}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            parentId: e.target.value || null,
                                        }))
                                    }
                                    disabled={saving}
                                >
                                    <option value="">— None —</option>
                                    {parentOptions.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="block text-sm font-medium">
                                Display order
                                <input
                                    type="number"
                                    min={0}
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    value={form.displayOrder ?? 0}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            displayOrder: Number(
                                                e.target.value,
                                            ),
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </label>
                            <label className="block text-sm font-medium">
                                Description
                                <textarea
                                    rows={2}
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    value={form.description ?? ""}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            description: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </label>
                            <label className="block text-sm font-medium">
                                Icon URL
                                <input
                                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                                    value={form.iconUrl ?? ""}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            iconUrl: e.target.value,
                                        }))
                                    }
                                    disabled={saving}
                                />
                            </label>
                            <label className="flex items-center gap-2 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={form.isActive ?? true}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            isActive: e.target.checked,
                                        }))
                                    }
                                    disabled={saving}
                                />
                                Active
                            </label>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                type="button"
                                className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
                                onClick={closeModal}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                                onClick={() => void submitForm()}
                                disabled={saving}
                            >
                                {saving ? "Saving…" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}

            <ConfirmDialog
                open={deactivateId != null}
                title="Deactivate category?"
                description="Products may lose this category link. You can create a new category later."
                confirmLabel="Deactivate"
                variant="danger"
                onClose={() => setDeactivateId(null)}
                onConfirm={() => void confirmDeactivate()}
            />
        </div>
    );
}
