import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function PageShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("min-h-screen bg-background text-foreground", className)}
            {...props}
        />
    );
}
