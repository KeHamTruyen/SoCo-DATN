import { Image, Sparkles, Tag } from "lucide-react";

interface PostComposerProps {
    /** When provided the card becomes a click-to-open trigger for a modal. */
    onOpen?: () => void;
}

export function PostComposer({ onOpen }: PostComposerProps) {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex gap-3">
                <div className="h-10 w-10 shrink-0 rounded-full bg-primary/20" />
                <button
                    type="button"
                    onClick={onOpen}
                    className="flex-1 rounded-xl bg-neutral-100 px-4 py-2.5 text-left text-sm text-neutral-500 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                >
                    What&apos;s on your mind? Share a product update...
                </button>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <div className="flex gap-1">
                    <button
                        type="button"
                        onClick={onOpen}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                        <Image className="h-4 w-4 text-info" />
                        Photo
                    </button>
                    <button
                        type="button"
                        onClick={onOpen}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                        <Tag className="h-4 w-4 text-success" />
                        Tag Product
                    </button>
                </div>
                <button
                    type="button"
                    onClick={onOpen}
                    className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary transition-all hover:bg-primary/20"
                >
                    <Sparkles className="h-4 w-4" />
                    AI Assistant
                </button>
            </div>
        </div>
    );
}
