import type { ReactNode } from "react";

export function Section({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                {title}
            </h3>
            <dl className="space-y-2">{children}</dl>
        </section>
    );
}
