import { ArrowLeft, BarChart2, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { feedApi } from "../features/feed/api/feedApi";
import type {
    ScheduledAnalyticsRange,
    ScheduledPostsAnalyticsResponse,
} from "../features/feed/types/feed.types";
import { Button } from "../shared/ui";
import { stripHtmlToPlain } from "../shared/tiptap/postHtmlUtils";

const RANGE_OPTIONS: Array<{ value: ScheduledAnalyticsRange; label: string }> = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
];

const EMPTY_ANALYTICS: ScheduledPostsAnalyticsResponse = {
    summary: {
        publishedCount: 0,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        engagement: 0,
        engagementRate: 0,
    },
    series: [],
    topPosts: [],
    range: "30d",
};

function formatCompactNumber(value: number) {
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
        value,
    );
}

function formatPercent(value: number) {
    return `${(value * 100).toFixed(1)}%`;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

export default function ScheduledPostsAnalytics() {
    const navigate = useNavigate();
    const [range, setRange] = useState<ScheduledAnalyticsRange>("30d");
    const [analytics, setAnalytics] =
        useState<ScheduledPostsAnalyticsResponse>(EMPTY_ANALYTICS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setIsLoading(true);
        void feedApi
            .getScheduledPostsAnalytics(range)
            .then((data) => {
                if (!mounted) return;
                setAnalytics(data);
            })
            .catch(() => {
                if (!mounted) return;
                setAnalytics({ ...EMPTY_ANALYTICS, range });
            })
            .finally(() => {
                if (mounted) {
                    setIsLoading(false);
                }
            });

        return () => {
            mounted = false;
        };
    }, [range]);

    const chartSeries = useMemo(
        () =>
            analytics.series.map((point) => ({
                ...point,
                label: formatDate(point.date),
            })),
        [analytics.series],
    );

    const summaryCards = [
        {
            label: "Published scheduled posts",
            value: analytics.summary.publishedCount.toLocaleString(),
            helper: `${range.toUpperCase()} range`,
            icon: BarChart2,
        },
        {
            label: "Total views",
            value: formatCompactNumber(analytics.summary.views),
            helper: `${analytics.summary.views.toLocaleString()} views`,
            icon: Eye,
        },
        {
            label: "Total engagement",
            value: formatCompactNumber(analytics.summary.engagement),
            helper: `${analytics.summary.likes} likes, ${analytics.summary.comments} comments, ${analytics.summary.shares} shares`,
            icon: Heart,
        },
        {
            label: "Engagement rate",
            value: formatPercent(analytics.summary.engagementRate),
            helper:
                analytics.summary.publishedCount > 0
                    ? `${Math.round(
                          analytics.summary.engagement / analytics.summary.publishedCount,
                      )} avg interactions/post`
                    : "No published posts yet",
            icon: Share2,
        },
    ];

    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 p-4 lg:p-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <Button variant="ghost" className="mb-3 px-0" onClick={() => navigate("/scheduled-posts")}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to Scheduled Posts
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Scheduled Posts Analytics
                        </h1>
                        <p className="mt-1 text-neutral-500 dark:text-neutral-400">
                            Performance overview for published scheduled posts.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {RANGE_OPTIONS.map((option) => (
                            <Button
                                key={option.value}
                                variant={range === option.value ? "primary" : "outline"}
                                onClick={() => setRange(option.value)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>

                <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
                        >
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <span className="text-sm font-medium text-neutral-500">
                                    {card.label}
                                </span>
                                <card.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="text-2xl font-black">
                                {isLoading ? "..." : card.value}
                            </div>
                            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                                {card.helper}
                            </p>
                        </div>
                    ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="mb-4 text-sm font-bold text-neutral-800 dark:text-neutral-100">
                            Views by publish date
                        </h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartSeries}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-neutral-200 dark:stroke-neutral-700"
                                    />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#ec5b13"
                                        strokeWidth={2}
                                        dot={{ r: 3 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                        <h2 className="mb-4 text-sm font-bold text-neutral-800 dark:text-neutral-100">
                            Engagement by publish date
                        </h2>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartSeries}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-neutral-200 dark:stroke-neutral-700"
                                    />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="engagement" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">Top Posts</h2>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            Ranked by engagement, then views
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"
                                />
                            ))}
                        </div>
                    ) : analytics.topPosts.length === 0 ? (
                        <div className="rounded-xl bg-neutral-50 p-8 text-center text-sm text-neutral-500 dark:bg-neutral-800/60 dark:text-neutral-400">
                            No published scheduled post analytics available for this range.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {analytics.topPosts.map((post) => (
                                <button
                                    key={post.scheduledPostId}
                                    type="button"
                                    className="flex w-full items-start gap-4 rounded-xl border border-neutral-200 p-4 text-left transition-colors hover:border-primary/40 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50"
                                    onClick={() => navigate(`/post/${post.publishedPostId}`)}
                                >
                                    {post.mediaUrls?.[0] ? (
                                        <img
                                            src={post.mediaUrls[0]}
                                            alt=""
                                            className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 shrink-0 rounded-lg bg-neutral-100 dark:bg-neutral-800" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-2 text-sm font-medium text-neutral-800 dark:text-neutral-100">
                                            {stripHtmlToPlain(post.content) || "Untitled post"}
                                        </p>
                                        <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                                            Scheduled {formatDate(post.scheduledTime)} • Published{" "}
                                            {formatDate(post.publishedAt)}
                                        </p>
                                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-neutral-300">
                                            <span className="inline-flex items-center gap-1">
                                                <Eye className="h-3.5 w-3.5" />
                                                {post.viewsCount.toLocaleString()}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Heart className="h-3.5 w-3.5" />
                                                {post.likesCount.toLocaleString()}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <MessageCircle className="h-3.5 w-3.5" />
                                                {post.commentsCount.toLocaleString()}
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Share2 className="h-3.5 w-3.5" />
                                                {post.sharesCount.toLocaleString()}
                                            </span>
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-semibold text-primary">
                                                {formatPercent(post.engagementRate)} ER
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>
        </main>
    );
}
