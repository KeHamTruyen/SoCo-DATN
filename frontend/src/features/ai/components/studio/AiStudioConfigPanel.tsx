import { Search, Sparkles, Wand2 } from "lucide-react";
import { cn } from "../../../../shared/lib/cn";
import { Button } from "../../../../shared/ui";
import { useAiStudio } from "../../context/AiStudioContext";
import { AI_LAB_TONES, AI_LAB_LENGTHS, lengthOptionLabel } from "../../utils/aiCreativeLabUtils";

const TONES = AI_LAB_TONES;
const LENGTHS = AI_LAB_LENGTHS;

export function AiStudioConfigPanel() {
    const { form, products, generator, canLinkProduct } = useAiStudio();
    
    return (
        <section className="flex w-full flex-col gap-8 border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-950/40 lg:w-2/5 lg:border-r lg:p-10">
            <header>
                <h2 className="mb-2 text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50 lg:text-3xl">
                    AI Studio
                </h2>
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    Synthesize premium marketing content using advanced AI models tailored for social commerce.
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
                        onClick={() => form.setMode(id)}
                        className={cn(
                            "flex-1 rounded-lg py-2 text-sm font-semibold transition-colors",
                            form.mode === id
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
                    value={form.prompt}
                    onChange={(e) => form.setPrompt(e.target.value)}
                    className="min-h-40 w-full resize-none rounded-xl border border-neutral-200 bg-white p-4 text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    placeholder="Ví dụ: Tạo bài viết quảng cáo cho đôi giày chạy bộ mới với tone giọng hào hứng"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        Tone
                    </label>
                    <select
                        value={form.toneMode === "preset" ? form.tonePreset : "custom"}
                        onChange={(e) => {
                            const v = e.target.value;
                            if (v === "custom") {
                                form.setToneMode("custom");
                                return;
                            }
                            form.setToneMode("preset");
                            form.setTonePreset(v as any);
                        }}
                        className="w-full appearance-none rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-10 text-sm text-neutral-900 focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                        {TONES.map((t) => (
                            <option key={t} value={t}>
                                {t}
                            </option>
                        ))}
                        <option value="custom">Tự nhập tone</option>
                    </select>
                    {form.toneMode === "custom" && (
                        <input
                            value={form.toneCustom}
                            onChange={(e) => form.setToneCustom(e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-4 text-sm text-neutral-900 focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                            placeholder="Ví dụ: Hào hứng nhưng tinh tế"
                        />
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        Length
                    </label>
                    <select
                        value={form.length}
                        onChange={(e) => form.setLength(e.target.value as any)}
                        className="w-full appearance-none rounded-xl border border-neutral-200 bg-white py-3 pl-4 pr-10 text-sm text-neutral-900 focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                        {LENGTHS.map((l) => (
                            <option key={l} value={l}>
                                {lengthOptionLabel(l)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap gap-6">
                <label className="group flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={form.withHashtags}
                        onChange={(e) => form.setWithHashtags(e.target.checked)}
                        className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-600"
                    />
                    <span className="text-sm font-medium text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100">
                        Hashtags
                    </span>
                </label>
                <label className="group flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={form.withCta}
                        onChange={(e) => form.setWithCta(e.target.checked)}
                        className="h-5 w-5 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-600"
                    />
                    <span className="text-sm font-medium text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100">
                        Call-to-Action
                    </span>
                </label>
            </div>

            {canLinkProduct && (
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
                            value={products.productQuery}
                            onChange={(e) => {
                                products.setProductQuery(e.target.value);
                                products.setSelectedProduct(null);
                                products.setProductDropdownOpen(true);
                            }}
                            className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                            placeholder="Search product catalogue..."
                            onFocus={() => products.setProductDropdownOpen(true)}
                            onBlur={() => {
                                setTimeout(() => products.setProductDropdownOpen(false), 200);
                            }}
                        />
                        {products.productDropdownOpen && (
                            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-60 overflow-auto rounded-xl border border-neutral-200 bg-white py-2 shadow-sm dark:border-neutral-700 dark:bg-neutral-950">
                                {products.isLoadingMyProducts ? (
                                    <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        Đang tải sản phẩm...
                                    </div>
                                ) : products.filteredMyProducts.length ? (
                                    products.filteredMyProducts.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            className="flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
                                            onClick={() => products.handleSelectProduct(p)}
                                        >
                                            <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                                                {p.title}
                                            </span>
                                            {p.price != null && (
                                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    Giá: {p.price}
                                                </span>
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400">
                                        Không tìm thấy sản phẩm phù hợp.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Button
                type="button"
                size="lg"
                className="mt-auto w-full gap-3 text-lg font-bold shadow-lg shadow-primary/20"
                disabled={generator.isGenerating}
                onClick={generator.handleGenerate}
            >
                <Wand2 className={cn("h-5 w-5", generator.isGenerating && "animate-pulse")} />
                {generator.isGenerating ? "Đang tạo..." : "Tạo nội dung"}
            </Button>
        </section>
    );
}
