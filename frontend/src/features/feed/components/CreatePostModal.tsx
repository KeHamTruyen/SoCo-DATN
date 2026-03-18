import {
    CalendarClock,
    ImagePlus,
    MapPin,
    Sparkles,
    Tag,
    Users,
    X,
    Zap,
} from "lucide-react";
import { useRef, useState } from "react";
import { Avatar } from "../../../shared/ui/atoms/avatar";
import { Button } from "../../../shared/ui/atoms/button";
import { useAuthSession } from "../../../shared/auth/useAuthSession";

interface CreatePostModalProps {
    onClose: () => void;
    onCreate: (content: string, scheduledAt?: string) => Promise<void>;
}

const AI_SUGGESTIONS = [
    {
        icon: <Zap className="h-4 w-4 text-indigo-600" />,
        label: "Write Caption",
        desc: "Generate an engaging product caption",
    },
    {
        icon: <Tag className="h-4 w-4 text-indigo-600" />,
        label: "Suggest Hashtags",
        desc: "Find trending hashtags for your post",
    },
    {
        icon: <Sparkles className="h-4 w-4 text-indigo-600" />,
        label: "Improve Text",
        desc: "Enhance your existing caption",
    },
];

export function CreatePostModal({ onClose, onCreate }: CreatePostModalProps) {
    const { user } = useAuthSession();
    const [content, setContent] = useState("");
    const [scheduledAt, setScheduledAt] = useState("");
    const [isScheduleMode, setIsScheduleMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePost = async () => {
        const trimmed = content.trim();
        if (!trimmed) return;
        setIsSubmitting(true);
        try {
            await onCreate(trimmed, isScheduleMode ? scheduledAt : undefined);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
            <div className="flex max-h-[95vh] w-full max-w-lg flex-col overflow-hidden rounded-t-xl border border-slate-200 bg-background-light shadow-2xl dark:border-slate-800 dark:bg-background-dark sm:rounded-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold">Create Post</h2>
                    <Button
                        size="sm"
                        className="rounded-full px-5"
                        onClick={() => void handlePost()}
                        disabled={!content.trim() || isSubmitting}
                    >
                        {isScheduleMode ? "Schedule" : "Post"}
                    </Button>
                </div>

                <div className="overflow-y-auto">
                    <div className="flex gap-3 px-4 py-4">
                        <Avatar
                            src={user?.avatarUrl ?? ""}
                            alt={user?.fullName ?? "You"}
                            wrapperClassName="h-10 w-10 shrink-0"
                        />
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What are you sharing today? Describe your product or mood..."
                            rows={4}
                            className="flex-1 resize-none border-none bg-transparent p-0 text-base placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:placeholder:text-slate-500"
                        />
                    </div>

                    <div className="px-4 pb-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="group relative flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 px-6 transition-colors hover:border-primary/50 dark:border-slate-700 dark:bg-slate-800/50"
                        >
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
                                <ImagePlus className="h-6 w-6 text-primary" />
                            </div>
                            <p className="font-medium">Add photos or videos</p>
                            <p className="mt-1 text-xs text-slate-500">Drag and drop or click to browse</p>
                            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" />
                        </button>
                    </div>

                    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
                        <button type="button" className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
                            <Tag className="h-3.5 w-3.5" />
                            Tag Products
                        </button>
                        <button type="button" className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
                            <MapPin className="h-3.5 w-3.5" />
                            Location
                        </button>
                        <button type="button" className="flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">
                            <Users className="h-3.5 w-3.5" />
                            Tag People
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsScheduleMode((v) => !v)}
                            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                isScheduleMode
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                            }`}
                        >
                            <CalendarClock className="h-3.5 w-3.5" />
                            Schedule
                        </button>
                    </div>

                    {isScheduleMode && (
                        <div className="px-4 py-3">
                            <label className="text-sm font-semibold">Schedule Date & Time</label>
                            <input
                                type="datetime-local"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                                className="mt-2 w-full rounded-lg border border-slate-200 bg-transparent px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700"
                            />
                        </div>
                    )}

                    <div className="mx-4 my-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-blue-950/30">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg shadow-indigo-500/20">
                                    <Sparkles className="h-4 w-4 text-white" />
                                </div>
                                <h3 className="text-sm font-bold tracking-tight">Magic AI Assistant</h3>
                            </div>
                            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                Experimental
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {AI_SUGGESTIONS.map((s) => (
                                <button
                                    key={s.label}
                                    type="button"
                                    className="group flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white p-2.5 text-left transition-all hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500"
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                                        {s.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">{s.label}</p>
                                        <p className="text-xs text-slate-500">{s.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
