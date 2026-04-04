import { X } from "lucide-react";
import type { PostMediaType } from "../../types/feed.types";

interface CreatePostMediaStripProps {
    mediaUrls: string[];
    mediaType: PostMediaType | undefined;
    onRemoveAt: (index: number) => void;
}

export function CreatePostMediaStrip({ mediaUrls, mediaType, onRemoveAt }: CreatePostMediaStripProps) {
    if (mediaUrls.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 px-4 pb-2 sm:px-6">
            {mediaUrls.map((url, i) => (
                <div
                    key={`${url}-${i}`}
                    className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-muted"
                >
                    {mediaType === "VIDEO" ? (
                        <video src={url} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                        <img src={url} alt="" className="h-full w-full object-cover" />
                    )}
                    <button
                        type="button"
                        onClick={() => onRemoveAt(i)}
                        className="absolute right-0.5 top-0.5 rounded-full bg-neutral-900/70 p-0.5 text-white"
                        aria-label="Remove media"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}
