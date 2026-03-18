import { Separator } from "../../atoms";

interface AuthDividerProps {
    text?: string;
}

export function AuthDivider({ text = "Or continue with" }: AuthDividerProps) {
    return (
        <div className="relative my-7">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-white px-3 text-xs font-medium uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    {text}
                </span>
            </div>
        </div>
    );
}
