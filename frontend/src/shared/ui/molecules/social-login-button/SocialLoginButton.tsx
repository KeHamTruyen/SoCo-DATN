import { Facebook } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";

type SocialProvider = "google" | "facebook";

interface SocialLoginButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    provider: SocialProvider;
}

const contentByProvider: Record<
    SocialProvider,
    { label: string; className: string; icon: ReactNode }
> = {
    google: {
        label: "Google",
        className:
            "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700",
        icon: (
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                />
                <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                />
                <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                />
                <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                    fill="#EA4335"
                />
            </svg>
        ),
    },
    facebook: {
        label: "Facebook",
        className: "bg-[#1877F2] text-white hover:bg-[#166fe5] border border-transparent",
        icon: <Facebook className="h-5 w-5 fill-white" />,
    },
};

export function SocialLoginButton({
    provider,
    className,
    type = "button",
    ...props
}: SocialLoginButtonProps) {
    const content = contentByProvider[provider];

    return (
        <button
            type={type}
            className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors",
                content.className,
                className,
            )}
            {...props}
        >
            {content.icon}
            <span>{content.label}</span>
        </button>
    );
}
