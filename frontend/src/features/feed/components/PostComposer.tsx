import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "../../../shared/ui";

interface PostComposerProps {
    onCreate: (content: string) => Promise<void> | void;
}

export function PostComposer({ onCreate }: PostComposerProps) {
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        void (async () => {
            setIsSubmitting(true);
            await onCreate(content.trim());
            setContent("");
            setIsSubmitting(false);
        })();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share a product update..."
                rows={3}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800"
            />
            <div className="mt-3 flex justify-end">
                <Button type="submit" disabled={isSubmitting || !content.trim()}>
                    <Send className="h-4 w-4" />
                    {isSubmitting ? "Posting..." : "Post"}
                </Button>
            </div>
        </form>
    );
}

