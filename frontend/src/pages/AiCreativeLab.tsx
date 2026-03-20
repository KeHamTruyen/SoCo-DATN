import {
    BarChart3,
    Bold,
    Calendar,
    CheckCircle,
    Copy,
    FolderOpen,
    Image as ImageIcon,
    Italic,
    List,
    Megaphone,
    Plus,
    RefreshCw,
    Search,
    Smile,
    Sparkles,
    Wand2,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button, UnifiedHeader } from "../shared/ui";
import { cn } from "../shared/lib/cn";

type StudioMode = "text" | "image" | "video";

const TONES = ["Excited", "Professional", "Fun", "Friendly"] as const;
const LENGTHS = ["Short", "Medium", "Long"] as const;

export default function AiCreativeLab() {
    const [mode, setMode] = useState<StudioMode>("text");
    const [prompt, setPrompt] = useState("");
    const [tone, setTone] = useState<(typeof TONES)[number]>("Excited");
    const [length, setLength] = useState<(typeof LENGTHS)[number]>("Medium");
    const [withHashtags, setWithHashtags] = useState(true);
    const [withCta, setWithCta] = useState(true);
    const [productQuery, setProductQuery] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);

    const handleGenerate = useCallback(() => {
        setIsGenerating(true);
        window.setTimeout(() => setIsGenerating(false), 600);
    }, []);

    const handleCopy = useCallback(async () => {
        const text = outputRef.current?.innerText ?? "";
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            /* ignore */
        }
    }, []);

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <UnifiedHeader
                navItems={[
                    { label: "Feed", to: "/feed" },
                    { label: "Marketplace", to: "/marketplace" },
                ]}
                activePath="/feed"
            />

            <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col lg:flex-row">
                {/* Studio sidebar */}
                <aside
                    className={cn(
                        "flex shrink-0 flex-col border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900",
                        "w-full border-b lg:w-64 lg:border-b-0 lg:border-r",
                    )}
                >
                    <div className="flex items-center gap-3 px-4 py-5 lg:px-4 lg:py-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-lg font-bold leading-tight text-neutral-900 dark:text-neutral-50">
                                Content Studio
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">With AI</p>
                        </div>
                    </div>
                    <nav className="flex flex-1 flex-col gap-1 px-2 pb-4 lg:px-3">
                        <button
                            type="button"
                            className="flex items-center gap-3 rounded-lg bg-white px-3 py-3 text-sm font-semibold text-primary shadow-sm dark:bg-neutral-950"
                        >
                            <Sparkles className="h-5 w-5" />
                            Studio
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                            <BarChart3 className="h-5 w-5" />
                            Analytics
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                            <Megaphone className="h-5 w-5" />
                            Campaigns
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-200/80 dark:text-neutral-400 dark:hover:bg-neutral-800"
                        >
                            <FolderOpen className="h-5 w-5" />
                            Library
                        </button>
                    </nav>
                    <div className="mt-auto flex flex-col gap-1 border-t border-neutral-200/80 px-2 pb-6 pt-4 dark:border-neutral-800">
                        <Button type="button" className="mx-1 gap-2 font-semibold">
                            <Plus className="h-4 w-4" />
                            Create New
                        </Button>
                    </div>
                </aside>

                {/* Main workspace */}
                <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
                    {/* Input panel */}
                    <section className="flex w-full flex-col gap-8 border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-950/40 lg:w-2/5 lg:border-r lg:p-10">
                        <header>
                            <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 lg:text-3xl">
                                AI Studio
                            </h2>
                            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                Synthesize premium marketing content using advanced AI models tailored for social
                                commerce.
                            </p>
                        </header>

                        <div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800/80">
                            {(
                                [
                                    { id: "text" as const, label: "Text" },
                                    { id: "image" as const, label: "Image++" },
                                    { id: "video" as const, label: "Video++" },
                                ] as const
                            ).map(({ id, label }) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => setMode(id)}
                                    className={cn(
                                        "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
                                        mode === id
                                            ? "bg-white text-primary shadow-sm dark:bg-neutral-900"
                                            : "font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                Describe your idea
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="min-h-[160px] w-full resize-none rounded-xl border border-neutral-200 bg-white p-4 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                placeholder="Ví dụ: Tạo bài viết quảng cáo cho đôi giày chạy bộ mới với tone giọng hào hứng"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                    Tone
                                </label>
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value as (typeof TONES)[number])}
                                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-10 text-sm text-neutral-900 focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    {TONES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                    Length
                                </label>
                                <select
                                    value={length}
                                    onChange={(e) => setLength(e.target.value as (typeof LENGTHS)[number])}
                                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-10 text-sm text-neutral-900 focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    {LENGTHS.map((l) => (
                                        <option key={l} value={l}>
                                            {l}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6">
                            <label className="group flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={withHashtags}
                                    onChange={(e) => setWithHashtags(e.target.checked)}
                                    className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-600"
                                />
                                <span className="text-sm font-medium text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100">
                                    Hashtags
                                </span>
                            </label>
                            <label className="group flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={withCta}
                                    onChange={(e) => setWithCta(e.target.checked)}
                                    className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-600"
                                />
                                <span className="text-sm font-medium text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100">
                                    Call-to-Action
                                </span>
                            </label>
                        </div>

                        <div className="rounded-2xl border border-neutral-200 bg-neutral-100 p-6 dark:border-neutral-700 dark:bg-neutral-800/50">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                                    Linked Product
                                </span>
                                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:bg-primary-950/60 dark:text-primary-400">
                                    SMART SYNC
                                </span>
                            </div>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                                <input
                                    type="text"
                                    value={productQuery}
                                    onChange={(e) => setProductQuery(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                    placeholder="Search product catalogue..."
                                />
                            </div>
                        </div>

                        <Button
                            type="button"
                            size="lg"
                            className="mt-auto w-full gap-3 text-lg font-bold shadow-lg shadow-primary/20"
                            disabled={isGenerating}
                            onClick={handleGenerate}
                        >
                            <Wand2 className={cn("h-5 w-5", isGenerating && "animate-pulse")} />
                            {isGenerating ? "Đang tạo..." : "Tạo nội dung"}
                        </Button>
                    </section>

                    {/* Output panel */}
                    <section className="relative flex w-full flex-1 flex-col gap-6 overflow-hidden bg-white p-6 dark:bg-neutral-950 lg:w-3/5 lg:p-10">
                        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />

                        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-xl font-extrabold text-neutral-900 dark:text-neutral-50 lg:text-2xl">
                                Kết quả được tạo bởi AI
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 font-semibold"
                                    onClick={handleGenerate}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Tạo lại
                                </Button>
                                <Button type="button" variant="outline" size="sm" className="gap-2 font-semibold" onClick={handleCopy}>
                                    <Copy className="h-4 w-4" />
                                    Sao chép
                                </Button>
                            </div>
                        </div>

                        <div className="relative z-10 flex min-h-[280px] flex-1 flex-col rounded-2xl border border-neutral-200 bg-neutral-50/80 p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/40 lg:p-8">
                            <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-700">
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                    >
                                        <Bold className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                    >
                                        <Italic className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                    >
                                        <List className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="hidden h-4 w-px bg-neutral-200 sm:block dark:bg-neutral-700" />
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                    >
                                        <Smile className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="flex h-8 w-8 items-center justify-center rounded text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div
                                ref={outputRef}
                                className="flex-1 text-base leading-relaxed text-neutral-900 outline-none dark:text-neutral-100"
                            >
                                <p className="mb-4">
                                    👟{" "}
                                    <strong className="text-primary">
                                        SẴN SÀNG BỨT PHÁ CÙNG ULTRAFLOW 2024!
                                    </strong>
                                </p>
                                <p className="mb-4">
                                    Bạn đang tìm kiếm sự kết hợp hoàn hảo giữa phong cách và tốc độ? Đôi giày chạy bộ
                                    UltraFlow thế hệ mới đã sẵn sàng để đồng hành cùng bạn trên mọi cung đường.
                                </p>
                                <p className="mb-4">Tại sao bạn không thể bỏ lỡ:</p>
                                <ul className="mb-4 ml-5 list-disc space-y-2">
                                    <li>Công nghệ đệm khí tiên tiến giúp giảm chấn tối đa.</li>
                                    <li>Chất liệu lưới thoáng khí, ôm sát bàn chân một cách tự nhiên.</li>
                                    <li>Thiết kế tối giản đầy tinh tế, phù hợp cả khi tập luyện lẫn dạo phố.</li>
                                </ul>
                                <p className="mb-4">
                                    Đừng để mục tiêu của bạn chờ đợi thêm nữa. Nâng tầm sải bước ngay hôm nay!
                                </p>
                                {withCta ? (
                                    <p className="mb-4 font-semibold text-primary">
                                        👉 Nhấn vào giỏ hàng để sở hữu ưu đãi -20% chỉ trong hôm nay!
                                    </p>
                                ) : null}
                                {withHashtags ? (
                                    <p className="italic text-neutral-600 dark:text-neutral-400">
                                        #UltraFlow #RunningShoes #FashionTech #BứtPhá #ActiveLife
                                    </p>
                                ) : null}
                                {prompt.trim() ? (
                                    <p className="mt-4 border-t border-neutral-200 pt-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">Ý tưởng:</span>{" "}
                                        {prompt}
                                        <span className="mt-1 block text-xs">
                                            Mode: {mode} · Tone: {tone} · Length: {length}
                                        </span>
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="relative z-10 flex flex-col items-stretch justify-end gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center dark:border-neutral-800">
                            <Link
                                to="/scheduled-posts"
                                className={cn(
                                    "inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-5 font-bold text-neutral-800 transition-all hover:bg-neutral-50 active:scale-[0.98] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
                                )}
                            >
                                <Calendar className="h-5 w-5" />
                                Lên lịch đăng
                            </Link>
                            <Link
                                to="/feed"
                                className={cn(
                                    "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary-700 active:scale-[0.98]",
                                )}
                            >
                                <CheckCircle className="h-5 w-5" />
                                Đăng ngay
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
