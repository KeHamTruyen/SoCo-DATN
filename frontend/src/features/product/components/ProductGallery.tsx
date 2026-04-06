import { Package, Heart } from "lucide-react";
import { useState } from "react";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const list = images.filter((u) => u && u.trim() !== "");

    if (list.length === 0) {
        return (
            <div className="flex aspect-4/5 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                <Package className="h-20 w-20 text-neutral-300 dark:text-neutral-600" />
            </div>
        );
    }

    return (
        <div className="flex flex-col-reverse gap-4 md:flex-row">
            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:flex-col md:overflow-y-auto md:pb-0">
                {list.map((img, idx) => (
                    <button
                        key={`${img}-${idx}`}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                            idx === activeIndex
                                ? "border-primary"
                                : "border-slate-200 hover:border-primary/50 dark:border-slate-800"
                        }`}
                    >
                        <img
                            src={img}
                            alt={`Product view ${idx + 1}`}
                            className="h-full w-full object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image View */}
            <div className="group relative flex-1 overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800 aspect-4/5">
                <img
                    src={list[activeIndex]}
                    alt="Main product view"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <button className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-slate-900 shadow-lg transition-colors hover:text-primary dark:bg-slate-900/90 dark:text-white">
                    <Heart className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
