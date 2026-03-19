import { useState } from "react";

interface ProductGalleryProps {
    images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const safeImages =
        images.length > 0
            ? images
            : [
                  "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop",
              ];

    return (
        <div className="space-y-3">
            <div className="aspect-square overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
                <img
                    src={safeImages[activeIndex]}
                    alt="Product"
                    className="h-full w-full object-cover"
                />
            </div>
            <div className="grid grid-cols-5 gap-2">
                {safeImages.map((img, idx) => (
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
