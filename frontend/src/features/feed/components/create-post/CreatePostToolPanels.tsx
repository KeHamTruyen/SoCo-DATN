import { ImagePlus, Loader2, MapPin, Smile, Tag, Users } from "lucide-react";
import type { RefObject } from "react";
import { Avatar } from "../../../../shared/ui/atoms/avatar";
import type { ProductListItem } from "../../../marketplace/types/marketplace.types";
import type { TaggedUserBrief } from "../../types/feed.types";
import type { ToolPanel } from "../../hooks/useCreatePostFormState";

interface FeelingPreset {
    emoji: string;
    label: string;
    value: string;
}

interface CreatePostToolPanelsProps {
    t: (key: string) => string;
    fileInputRef: RefObject<HTMLInputElement | null>;
    toolPanel: ToolPanel;
    togglePanel: (p: ToolPanel) => void;
    uploadBusy: boolean;
    mediaUrlsLength: number;
    appendMedia: (files: FileList | null) => Promise<void>;
    productQuery: string;
    setProductQuery: (q: string) => void;
    productSearching: boolean;
    productHits: ProductListItem[];
    productId: string | null;
    onSelectProduct: (p: ProductListItem) => void;
    onClearProduct: () => void;
    friendQuery: string;
    setFriendQuery: (q: string) => void;
    friendSearching: boolean;
    friendHits: TaggedUserBrief[];
    onSelectFriend: (u: TaggedUserBrief) => void;
    feelingPresets: FeelingPreset[];
    feeling: string | null;
    setFeeling: (v: string | null) => void;
    setToolPanel: (p: ToolPanel) => void;
    location: string;
    setLocation: (v: string) => void;
    fillLocationFromGeo: () => void;
}

export function CreatePostToolPanels({
    t,
    fileInputRef,
    toolPanel,
    togglePanel,
    uploadBusy,
    mediaUrlsLength,
    appendMedia,
    productQuery,
    setProductQuery,
    productSearching,
    productHits,
    productId,
    onSelectProduct,
    onClearProduct,
    friendQuery,
    setFriendQuery,
    friendSearching,
    friendHits,
    onSelectFriend,
    feelingPresets,
    feeling,
    setFeeling,
    setToolPanel,
    location,
    setLocation,
    fillLocationFromGeo,
}: CreatePostToolPanelsProps) {
    return (
        <div className="px-4 pb-4 sm:px-6">
            <div
                role="toolbar"
                aria-label={t("createPost.addToPost")}
                className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-muted/30 px-3 py-2.5 dark:bg-muted/20"
            >
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                    {t("createPost.addToPost")}
                </span>
                <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        aria-hidden
                        onChange={(e) => {
                            void appendMedia(e.target.files);
                            e.target.value = "";
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadBusy || mediaUrlsLength >= 10}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                        aria-label="Add photos or videos"
                    >
                        {uploadBusy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ImagePlus className="h-4 w-4" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => togglePanel("product")}
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${toolPanel === "product" ? "ring-2 ring-primary/30" : ""}`}
                        aria-label={t("createPost.tagProducts")}
                    >
                        <Tag className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => togglePanel("friends")}
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${toolPanel === "friends" ? "ring-2 ring-primary/30" : ""}`}
                        aria-label={t("createPost.tagFriends")}
                    >
                        <Users className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => togglePanel("feeling")}
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${toolPanel === "feeling" ? "ring-2 ring-primary/30" : ""}`}
                        aria-label={t("createPost.feelingActivity")}
                    >
                        <Smile className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => togglePanel("location")}
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${toolPanel === "location" ? "ring-2 ring-primary/30" : ""}`}
                        aria-label={t("createPost.location")}
                    >
                        <MapPin className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {toolPanel === "product" ? (
                <div className="mt-3 space-y-2 rounded-xl border border-border bg-card p-3">
                    <p className="text-sm font-semibold text-foreground">{t("createPost.tagProducts")}</p>
                    <input
                        value={productQuery}
                        onChange={(e) => setProductQuery(e.target.value)}
                        placeholder={t("createPost.searchProduct")}
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    />
                    {productSearching ? (
                        <p className="text-xs text-muted-foreground">{t("createPost.searching")}</p>
                    ) : null}
                    <ul className="max-h-40 space-y-1 overflow-y-auto">
                        {productHits.map((p) => (
                            <li key={p.id}>
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
                                    onClick={() => onSelectProduct(p)}
                                >
                                    {p.imageUrl ? (
                                        <img
                                            src={p.imageUrl}
                                            alt=""
                                            className="h-9 w-9 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="h-9 w-9 rounded-md bg-muted" />
                                    )}
                                    <span className="line-clamp-1 font-medium">{p.name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {productId ? (
                        <button
                            type="button"
                            className="text-xs font-medium text-primary hover:underline"
                            onClick={onClearProduct}
                        >
                            {t("createPost.removeProduct")}
                        </button>
                    ) : null}
                </div>
            ) : null}

            {toolPanel === "friends" ? (
                <div className="mt-3 space-y-2 rounded-xl border border-border bg-card p-3">
                    <p className="text-sm font-semibold text-foreground">{t("createPost.tagFriends")}</p>
                    <input
                        value={friendQuery}
                        onChange={(e) => setFriendQuery(e.target.value)}
                        placeholder={t("createPost.searchFriend")}
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    />
                    {friendSearching ? (
                        <p className="text-xs text-muted-foreground">{t("createPost.searching")}</p>
                    ) : null}
                    <ul className="max-h-40 space-y-1 overflow-y-auto">
                        {friendHits.map((u) => (
                            <li key={u.id}>
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-muted"
                                    onClick={() => onSelectFriend(u)}
                                >
                                    <Avatar
                                        src={u.avatarUrl}
                                        alt={u.fullName ?? u.username ?? ""}
                                        wrapperClassName="h-8 w-8 shrink-0"
                                    />
                                    <span className="font-medium">{u.fullName ?? u.username}</span>
                                    {u.username ? (
                                        <span className="text-muted-foreground">@{u.username}</span>
                                    ) : null}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            {toolPanel === "feeling" ? (
                <div className="mt-3 rounded-xl border border-border bg-card p-3">
                    <p className="mb-2 text-sm font-semibold text-foreground">
                        {t("createPost.feelingActivity")}
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {feelingPresets.map((f) => (
                            <button
                                key={f.value}
                                type="button"
                                className={`rounded-lg border px-2 py-2 text-left text-xs transition-colors hover:bg-muted ${feeling === f.value ? "border-primary ring-1 ring-primary" : "border-border"}`}
                                onClick={() => {
                                    setFeeling(f.value);
                                    setToolPanel("none");
                                }}
                            >
                                <span className="mr-1">{f.emoji}</span>
                                {f.label}
                            </button>
                        ))}
                    </div>
                    {feeling ? (
                        <button
                            type="button"
                            className="mt-2 text-xs font-medium text-primary hover:underline"
                            onClick={() => setFeeling(null)}
                        >
                            {t("createPost.removeFeeling")}
                        </button>
                    ) : null}
                </div>
            ) : null}

            {toolPanel === "location" ? (
                <div className="mt-3 space-y-2 rounded-xl border border-border bg-card p-3">
                    <p className="text-sm font-semibold text-foreground">{t("createPost.location")}</p>
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={t("createPost.searchLocation")}
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    />
                    <button
                        type="button"
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => fillLocationFromGeo()}
                    >
                        {t("createPost.useGPS")}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
