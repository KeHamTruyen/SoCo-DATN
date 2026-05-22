import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import type { PostMediaType } from "../types/feed.types";
import { cn } from "../../../shared/lib/cn";

interface PostMediaCarouselProps {
    mediaUrls: string[];
    mediaType?: PostMediaType | null;
    className?: string;
    mediaClassName?: string;
    imageAlt?: string;
    children?: ReactNode;
}

function uniqueUrls(urls: string[]) {
    return [...new Set(urls.filter((url) => typeof url === "string" && url.trim().length > 0))];
}

export function PostMediaCarousel({
    mediaUrls,
    mediaType,
    className,
    mediaClassName,
    imageAlt = "Post attachment",
    children,
}: PostMediaCarouselProps) {
    const urls = useMemo(() => uniqueUrls(mediaUrls), [mediaUrls]);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeUrl = urls[Math.min(activeIndex, Math.max(urls.length - 1, 0))];
    const hasMultiple = urls.length > 1;
    const isVideo = mediaType === "VIDEO";

    if (!activeUrl) return null;

    const goPrev = () => {
        setActiveIndex((index) => (index - 1 + urls.length) % urls.length);
    };

    const goNext = () => {
        setActiveIndex((index) => (index + 1) % urls.length);
    };

    return (
        <div className={cn("group relative overflow-hidden bg-neutral-200 dark:bg-neutral-800", className)}>
            {isVideo ? (
                <video
                    key={activeUrl}
                    src={activeUrl}
                    controls
                    className={cn("h-full w-full object-cover", mediaClassName)}
                    playsInline
                />
            ) : (
                <img
                    src={activeUrl}
                    alt={hasMultiple ? `${imageAlt} ${activeIndex + 1}` : imageAlt}
                    className={cn("h-full w-full object-cover", mediaClassName)}
                />
            )}

            {children}

            {hasMultiple ? (
                <>
                    <button
                        type="button"
                        aria-label="Previous media"
                        onClick={(e) => {
                            e.stopPropagation();
                            goPrev();
                        }}
                        className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/65 text-white shadow transition hover:bg-neutral-950/80"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Next media"
                        onClick={(e) => {
                            e.stopPropagation();
                            goNext();
                        }}
                        className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-950/65 text-white shadow transition hover:bg-neutral-950/80"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 right-3 z-20 rounded-full bg-neutral-950/75 px-2.5 py-1 text-xs font-semibold text-white shadow">
                        {activeIndex + 1}/{urls.length}
                    </div>
                    <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                        {urls.map((url, index) => (
                            <button
                                key={`${url}-${index}`}
                                type="button"
                                aria-label={`Show media ${index + 1}`}
                                aria-pressed={index === activeIndex}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveIndex(index);
                                }}
                                className={cn(
                                    "h-2 rounded-full transition-all",
                                    index === activeIndex
                                        ? "w-5 bg-white"
                                        : "w-2 bg-white/55 hover:bg-white/80",
                                )}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
}
