import type { ReactNode } from "react";

export function DetailRow({
    label,
    children,
}: {
    label: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-1 sm:grid-cols-[minmax(0,140px)_1fr] sm:items-start">
            <dt className="text-xs font-medium text-muted-foreground">
                {label}
            </dt>
            <dd className="text-sm wrap-break-word text-foreground">{children}</dd>
        </div>
    );
}
