import { ShoppingBag } from "lucide-react";
import { cn } from "../../../lib/cn";

interface BrandLogoProps {
    name?: string;
    className?: string;
}

export function BrandLogo({ name = "SocialCommerce", className }: BrandLogoProps) {
    return (
        <div className={cn("inline-flex items-center gap-2 text-primary", className)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                <ShoppingBag className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {name}
            </span>
        </div>
    );
}
