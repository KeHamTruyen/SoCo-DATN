import {
    ChevronLeft,
    ChevronRight,
    FolderOpen,
    ImageOff,
    Loader2,
    Package,
    Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { aiApi, type AiContentHistoryItem } from "../../api/aiApi";
import { useAiStudio } from "../../context/AiStudioContext";
import { Button } from "../../../../shared/ui";
import { cn } from "../../../../shared/lib/cn";
import { resolveApiAssetUrl } from "../../../../shared/lib/resolveApiAssetUrl";

/** Strip server-side product attachment from the stored prompt for card display. */
function extractIdeaFromStoredPrompt(prompt: string): string {
    const t = prompt.trim();
    const match = t.match(/^([\s\S]*?)\.\s*Linked product:/i);
    if (match) {
        const idea = match[1].trim();
        if (idea) return idea;
    }
    if (/^Linked product:/i.test(t)) return "";
    return t;
}

function displayIdeaForCard(item: AiContentHistoryItem): string {
    const fromIdea = item.sourceIdea?.trim();
    if (fromIdea) return fromIdea;
    const fromPrompt = extractIdeaFromStoredPrompt(item.prompt ?? "");
    return fromPrompt || "—";
}

function libraryUsageStatus(
    item: AiContentHistoryItem,
): "draft" | "scheduled" | "posted" {
    if (!item.usedForId?.trim()) return "draft";
    if (item.usedForType === "scheduled_post") return "scheduled";
    return "posted";
}

function historyTypeLabel(
    contentType: string | null,
    t: (k: string) => string,
): string {
    const c = contentType?.trim().toLowerCase() ?? "";
    switch (c) {
        case "image_text":
            return t("aiCreativeLab.library.typeImage");
        case "video_text":
            return t("aiCreativeLab.library.typeVideo");
        case "text":
            return t("aiCreativeLab.library.typeText");
        default:
            return t("aiCreativeLab.library.typeUnknown");
    }
}

function LibraryProductThumb({ rawUrl }: { rawUrl: string | null | undefined }) {
    const [broken, setBroken] = useState(false);
    const resolved = rawUrl ? resolveApiAssetUrl(rawUrl) : null;

    if (!resolved || broken) {
        return (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
                <ImageOff className="h-10 w-10" />
            </div>
        );
    }

    return (
        <img
            alt=""
            src={resolved}
            referrerPolicy="no-referrer"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover"
        />
    );
}

type LibraryFilter = "all" | "draft" | "scheduled" | "posted";
type LibrarySort = "desc" | "asc";

export function AiLibraryPanel() {
    const { t, i18n } = useTranslation();
    const { restoreFromHistoryItem } = useAiStudio();
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [filter, setFilter] = useState<LibraryFilter>("all");
    const [sort, setSort] = useState<LibrarySort>("desc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [items, setItems] = useState<AiContentHistoryItem[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await aiApi.getHistory({
                page,
                limit,
                filter: filter === "all" ? undefined : filter,
                sort,
            });
            setItems(data.items);
            setTotalPages(data.pagination.totalPages);
        } catch (e) {
            setError(
                e instanceof Error ? e.message : t("aiCreativeLab.library.loadError"),
            );
            setItems([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [page, limit, filter, sort, t]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [filter, sort]);

    const handleDelete = useCallback(
        async (id: string) => {
            if (!window.confirm(t("aiCreativeLab.library.deleteConfirm"))) return;
            setDeletingId(id);
            setError(null);
            try {
                await aiApi.deleteHistory(id);
                await load();
            } catch (e) {
                setError(
                    e instanceof Error
                        ? e.message
                        : t("aiCreativeLab.library.loadError"),
                );
            } finally {
                setDeletingId(null);
            }
        },
        [load, t],
    );

    const fmtDate = useCallback(
        (iso: string) => {
            try {
                return new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: "medium",
                    timeStyle: "short",
                }).format(new Date(iso));
            } catch {
                return iso;
            }
        },
        [i18n.language],
    );

    const filterBtn = (value: LibraryFilter, label: string) => (
        <button
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                filter === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
            )}
        >
            {label}
        </button>
    );

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white dark:bg-neutral-950">
            <div className="border-b border-neutral-200 px-6 py-5 dark:border-neutral-800 lg:px-10">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <FolderOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50">
                            {t("aiCreativeLab.library.title")}
                        </h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            {t("aiCreativeLab.library.subtitle")}
                        </p>
                    </div>
                </div>
                <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {t("aiCreativeLab.library.mediaNote")}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {filterBtn("all", t("aiCreativeLab.library.filterAll"))}
                    {filterBtn("draft", t("aiCreativeLab.library.filterDraft"))}
                    {filterBtn(
                        "scheduled",
                        t("aiCreativeLab.library.filterScheduled"),
                    )}
                    {filterBtn("posted", t("aiCreativeLab.library.filterPosted"))}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {t("aiCreativeLab.library.sortLabel")}
                    </span>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as LibrarySort)}
                        className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                    >
                        <option value="desc">{t("aiCreativeLab.library.sortNewest")}</option>
                        <option value="asc">{t("aiCreativeLab.library.sortOldest")}</option>
                    </select>
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 lg:px-10">
                {loading && (
                    <div className="flex items-center justify-center gap-2 py-16 text-neutral-500">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>{t("aiCreativeLab.library.loading")}</span>
                    </div>
                )}

                {!loading && error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
                        {error}
                    </p>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
                        <FolderOpen className="h-10 w-10 text-neutral-400" />
                        <p className="font-medium text-neutral-600 dark:text-neutral-400">
                            {t("aiCreativeLab.library.empty")}
                        </p>
                    </div>
                )}

                {!loading && !error && items.length > 0 && (
                    <ul className="flex flex-col gap-4">
                        {items.map((item) => {
                            const usage = libraryUsageStatus(item);
                            const pid = item.linkedProductId?.trim();

                            const statusLabel =
                                usage === "draft"
                                    ? t("aiCreativeLab.library.statusDraft")
                                    : usage === "scheduled"
                                      ? t("aiCreativeLab.library.statusScheduled")
                                      : t("aiCreativeLab.library.statusPosted");
                            const statusClass =
                                usage === "draft"
                                    ? "bg-amber-500/15 text-amber-900 dark:text-amber-100"
                                    : usage === "scheduled"
                                      ? "bg-sky-500/15 text-sky-900 dark:text-sky-100"
                                      : "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200";

                            return (
                                <li
                                    key={item.id}
                                    className="overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50/80 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50"
                                >
                                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:gap-4">
                                        <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-neutral-200/80 dark:bg-neutral-800 sm:h-28 sm:w-28">
                                            <LibraryProductThumb rawUrl={item.productImageUrl} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {fmtDate(item.createdAt)}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                                                        statusClass,
                                                    )}
                                                >
                                                    {statusLabel}
                                                </span>
                                                <span
                                                    className={cn(
                                                        "rounded-full px-2 py-0.5 text-xs font-semibold",
                                                        "bg-primary/10 text-primary",
                                                    )}
                                                >
                                                    {historyTypeLabel(item.contentType, t)}
                                                </span>
                                            </div>
                                            <p className="mt-2 line-clamp-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                                                {displayIdeaForCard(item)}
                                            </p>
                                            {pid && item.productTitle ? (
                                                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                                                    <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                        {t("aiCreativeLab.library.linkedProductPrefix")}
                                                    </span>{" "}
                                                    <Link
                                                        to={`/products/${encodeURIComponent(pid)}`}
                                                        className="inline-flex flex-wrap items-center gap-1.5 font-medium text-primary hover:underline"
                                                    >
                                                        <Package className="h-4 w-4 shrink-0" />
                                                        <span className="line-clamp-2">
                                                            {item.productTitle}
                                                        </span>
                                                    </Link>
                                                </p>
                                            ) : null}
                                            <div className="mt-3 flex flex-wrap justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="gap-1.5 font-semibold"
                                                    disabled={deletingId === item.id}
                                                    onClick={() =>
                                                        void handleDelete(item.id)
                                                    }
                                                >
                                                    {deletingId === item.id ? (
                                                        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4 shrink-0" />
                                                    )}
                                                    {t("aiCreativeLab.library.delete")}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="font-semibold"
                                                    onClick={() =>
                                                        restoreFromHistoryItem({
                                                            prompt: item.prompt,
                                                            generatedContent:
                                                                item.generatedContent,
                                                        })
                                                    }
                                                >
                                                    {t("aiCreativeLab.library.restore")}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {!loading && !error && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 border-t border-neutral-200 px-6 py-4 dark:border-neutral-800">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        className="gap-1"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {t("aiCreativeLab.library.prev")}
                    </Button>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {t("aiCreativeLab.library.pageOf", {
                            page,
                            totalPages,
                        })}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        className="gap-1"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                        {t("aiCreativeLab.library.next")}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
