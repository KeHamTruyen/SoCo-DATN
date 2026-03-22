import { Package } from "lucide-react";
import { useState } from "react";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const list = images.filter((u) => u && u.trim() !== "");

    if (list.length === 0) {
        return (
            <div className="space-y-3">
                <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-800">
                    <Package className="h-20 w-20 text-neutral-300 dark:text-neutral-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <img
                    src={list[activeIndex]}
                    alt="Product"
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="grid grid-cols-5 gap-2">
                {list.map((img, idx) => (
                    <button
                        key={`${img}-${idx}`}
                        type="button"
                        onClick={() => setActiveIndex(idx)}
                        className={`aspect-square overflow-hidden rounded-lg border ${
                            idx === activeIndex
                                ? "border-primary"
                                : "border-neutral-200 dark:border-neutral-700"
                        }`}
                    >
                        <img
                            src={img}
                            alt={`Thumb ${idx + 1}`}
                            className="h-full w-full object-cover"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
