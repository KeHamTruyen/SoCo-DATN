import type { ReactNode } from "react";
import { Card } from "../../atoms";
import { BrandLogo } from "../brand-logo/BrandLogo";
import { cn } from "../../../lib/cn";

interface AuthCardProps {
    title: string;
    subtitle?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
}

export function AuthCard({
    title,
    subtitle,
    children,
    footer,
    className,
}: AuthCardProps) {
    return (
        <Card
            className={cn(
                "w-full max-w-md border-slate-200 p-6 shadow-2xl shadow-primary/5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-8",
                className,
            )}
        >
            <div className="mb-6 flex justify-center">
                <BrandLogo />
            </div>
            <div className="mb-7 space-y-2 text-center">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
                    {title}
                </h1>
                {subtitle ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {subtitle}
                    </p>
                ) : null}
            </div>
            {children}
            {footer ? <div className="mt-8 text-center">{footer}</div> : null}
        </Card>
    );
}
