import { format } from "date-fns";
import "react-day-picker/style.css";

import type { CreatePostPayload } from "../types/feed.types";
import { useTranslation } from "react-i18next";
import { PostBodyEditor } from "./PostBodyEditor";
import { useCreatePostFormState, type CreatePostInitialValues } from "../hooks/useCreatePostFormState";
import { CreatePostModalHeader } from "./create-post/CreatePostModalHeader";
import { CreatePostAuthorRow } from "./create-post/CreatePostAuthorRow";
import { CreatePostMediaStrip } from "./create-post/CreatePostMediaStrip";
import { CreatePostMetaChips } from "./create-post/CreatePostMetaChips";
import { CreatePostToolPanels } from "./create-post/CreatePostToolPanels";
import { CreatePostFeatureCards } from "./create-post/CreatePostFeatureCards";
import { CreatePostScheduleSection } from "./create-post/CreatePostScheduleSection";

export type { CreatePostInitialValues };

interface CreatePostModalProps {
    onClose: () => void;
    onCreate: (payload: CreatePostPayload) => Promise<void>;
    defaultScheduleMode?: boolean;
    groupId?: string;
    initialValues?: CreatePostInitialValues;
    hideScheduleOption?: boolean;
    title?: string;
    submitLabel?: string;
}

export function CreatePostModal({
    onClose,
    onCreate,
    defaultScheduleMode = false,
    groupId,
    initialValues,
    hideScheduleOption = false,
    title,
    submitLabel,
}: CreatePostModalProps) {
    const { t } = useTranslation();
    const form = useCreatePostFormState({
        onClose,
        onCreate,
        defaultScheduleMode,
        groupId,
        initialValues,
        hideScheduleOption,
    });

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-neutral-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="flex max-h-[min(92vh,900px)] w-full max-w-[min(100vw-1rem,56rem)] flex-col overflow-hidden rounded-t-xl border border-neutral-200 bg-background-light shadow-2xl dark:border-neutral-800 dark:bg-background-dark sm:rounded-xl lg:max-w-[min(100vw-2rem,64rem)]">
                <CreatePostModalHeader
                    title={title ?? t("createPost.title")}
                    submitLabel={submitLabel ?? (form.isScheduleMode ? t("createPost.schedule") : t("createPost.post"))}
                    canSubmit={form.canSubmit}
                    onClose={onClose}
                    onSubmit={form.handlePost}
                />

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <CreatePostAuthorRow
                        displayName={form.displayName}
                        avatarUrl={form.user?.avatarUrl}
                        username={form.user?.username}
                        groupId={form.groupId}
                        groupVisibilityLabel={t("createPost.visibility.group")}
                        visibility={form.visibility}
                        onVisibilityChange={form.setVisibility}
                        visibilityLabel={t("createPost.visibility.label")}
                        visibilityPublic={t("createPost.visibility.public")}
                        visibilityFollowers={t("createPost.visibility.followers")}
                        visibilityFollowing={t("createPost.visibility.following")}
                        visibilityPrivate={t("createPost.visibility.private")}
                    />

                    <div className="px-4 pb-3 pt-3 sm:px-6 sm:pb-4 sm:pt-4">
                        <PostBodyEditor
                            defaultHtml={form.content}
                            onHtmlChange={form.setContent}
                            hideEmoji
                            hideInsertImage
                        />
                    </div>

                    <CreatePostMediaStrip
                        mediaUrls={form.mediaUrls}
                        mediaType={form.mediaType}
                        onRemoveAt={form.removeMediaAt}
                    />

                    <CreatePostMetaChips
                        productLabel={form.productLabel}
                        productLabelPrefix={t("createPost.productLabel")}
                        taggedUsers={form.taggedUsers}
                        feeling={form.feeling}
                        location={form.location}
                        onRemoveTaggedUser={form.removeTaggedUser}
                    />

                    <CreatePostToolPanels
                        t={t}
                        fileInputRef={form.fileInputRef}
                        toolPanel={form.toolPanel}
                        togglePanel={form.togglePanel}
                        uploadBusy={form.uploadBusy}
                        mediaUrlsLength={form.mediaUrls.length}
                        appendMedia={form.appendMedia}
                        productQuery={form.productQuery}
                        setProductQuery={form.setProductQuery}
                        productSearching={form.productSearching}
                        productHits={form.productHits}
                        productId={form.productId}
                        onSelectProduct={(p) => {
                            form.setProductId(p.id);
                            form.setProductLabel(p.name);
                            form.setToolPanel("none");
                        }}
                        onClearProduct={() => {
                            form.setProductId(null);
                            form.setProductLabel(null);
                        }}
                        friendQuery={form.friendQuery}
                        setFriendQuery={form.setFriendQuery}
                        friendSearching={form.friendSearching}
                        friendHits={form.friendHits}
                        onSelectFriend={(u) => {
                            form.addTaggedUser(u);
                            form.setFriendQuery("");
                            form.setFriendHits([]);
                        }}
                        feelingPresets={form.FEELING_PRESETS}
                        feeling={form.feeling}
                        setFeeling={form.setFeeling}
                        setToolPanel={form.setToolPanel}
                        location={form.location}
                        setLocation={form.setLocation}
                        fillLocationFromGeo={form.fillLocationFromGeo}
                    />

                    <CreatePostFeatureCards
                        hideScheduleOption={form.hideScheduleOption}
                        isScheduleMode={form.isScheduleMode}
                        aiTitle={t("createPost.aiCreativeLab")}
                        aiDescription={t("createPost.aiCreativeLabDesc")}
                        scheduleTitle={t("createPost.schedulePost")}
                        scheduleDescription={t("createPost.schedulePostDesc")}
                        onOpenAiLab={form.openAiCreativeLab}
                        onToggleSchedule={form.toggleSchedule}
                    />

                    {form.isScheduleMode ? (
                        <CreatePostScheduleSection
                            schedulePanelRef={form.schedulePanelRef}
                            rdpThemeStyle={form.rdpThemeStyle}
                            scheduleDate={form.scheduleDate}
                            onSelectDate={form.setScheduleDate}
                            scheduleTime={form.scheduleTime}
                            onScheduleTimeChange={form.setScheduleTime}
                            timeLabel={t("createPost.time")}
                            scheduleHeading={t("createPost.scheduleDateTime")}
                            postNowLabel={t("createPost.postNowInstead")}
                            onPostNowInstead={() => {
                                form.setIsScheduleMode(false);
                                form.setScheduleDate(undefined);
                                form.setScheduleTime(format(new Date(), "HH:mm"));
                            }}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
