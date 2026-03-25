import { CalendarClock, Rocket, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function SellerCreativeStudioBanner() {
    return (
        <section
            className="rounded-2xl bg-linear-to-br from-primary to-orange-600 p-5 text-white shadow-lg shadow-primary/20"
            aria-label="AI Creative Studio"
        >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 shrink-0" />
                        <h2 className="text-base font-bold">AI Creative Studio</h2>
                    </div>
                    <p className="text-xs text-white/80">
                        Gợi ý nội dung và lên lịch bài đăng nhanh hơn.
                    </p>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row sm:justify-end md:w-auto md:min-w-[min(100%,22rem)]">
                    <Link
                        to="/ai-creative-lab"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 py-2 text-sm font-semibold backdrop-blur-sm transition-all hover:bg-white/30 sm:w-auto sm:min-w-40"
                    >
                        <Rocket className="h-3.5 w-3.5" />
                        AI Creative Lab
                    </Link>
                    <Link
                        to="/scheduled-posts"
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-bold text-primary transition-all sm:w-auto sm:min-w-40"
                    >
                        <CalendarClock className="h-3.5 w-3.5" />
                        Scheduled Posts
                    </Link>
                </div>
            </div>
        </section>
    );
}
