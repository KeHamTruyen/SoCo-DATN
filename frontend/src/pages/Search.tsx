import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchApi, type UnifiedSearchResponse } from "../features/search/api/searchApi";
import { UnifiedHeader } from "../shared/ui";

function asObject(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const q = (searchParams.get("q") ?? "").trim();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<UnifiedSearchResponse | null>(null);

    useEffect(() => {
        if (!q) {
            setResult(null);
            setError(null);
            return;
        }
        let cancelled = false;
        setIsLoading(true);
        setError(null);
        void searchApi
            .search(q, { limit: 8 })
            .then((data) => {
                if (!cancelled) setResult(data);
            })
            .catch(() => {
                if (!cancelled) setError("Unable to search right now.");
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [q]);

    const summary = useMemo(() => {
        if (!result) return 0;
        return result.products.total + result.users.total + result.posts.total;
    }, [result]);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <UnifiedHeader activePath="/marketplace" />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-bold text-foreground">Search</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Query: <span className="font-semibold text-foreground">{q || "(empty)"}</span>
                </p>

                {isLoading ? <p className="mt-6 text-sm text-muted-foreground">Loading...</p> : null}
                {error ? <p className="mt-6 text-sm text-destructive">{error}</p> : null}
                {!isLoading && !error && q && result ? (
                    <p className="mt-4 text-sm text-muted-foreground">
                        Found {summary} results.
                    </p>
                ) : null}

                {!q ? (
                    <p className="mt-8 text-sm text-muted-foreground">
                        Enter a search keyword from the header to start.
                    </p>
                ) : null}

                {result ? (
                    <div className="mt-8 grid grid-cols-1 gap-6">
                        <section className="rounded-xl border border-border p-4">
                            <h2 className="text-lg font-semibold">Products ({result.products.total})</h2>
                            <ul className="mt-3 space-y-2">
                                {result.products.items.map((item, idx) => {
                                    const value = asObject(item);
                                    const title = String(value.title ?? "Untitled product");
                                    const id = String(value.id ?? idx);
                                    return (
                                        <li key={`p-${id}`} className="text-sm">
                                            <Link className="text-primary hover:underline" to={`/products/${id}`}>
                                                {title}
                                            </Link>
                                        </li>
                                    );
                                })}
                                {result.products.items.length === 0 ? (
                                    <li className="text-sm text-muted-foreground">No products found.</li>
                                ) : null}
                            </ul>
                        </section>

                        <section className="rounded-xl border border-border p-4">
                            <h2 className="text-lg font-semibold">Users ({result.users.total})</h2>
                            <ul className="mt-3 space-y-2">
                                {result.users.items.map((item, idx) => {
                                    const value = asObject(item);
                                    const id = String(value.id ?? idx);
                                    const username = String(value.username ?? "unknown");
                                    const fullName = String(value.fullName ?? username);
                                    return (
                                        <li key={`u-${id}`} className="text-sm">
                                            <Link className="text-primary hover:underline" to={`/profile/${id}`}>
                                                {fullName} (@{username})
                                            </Link>
                                        </li>
                                    );
                                })}
                                {result.users.items.length === 0 ? (
                                    <li className="text-sm text-muted-foreground">No users found.</li>
                                ) : null}
                            </ul>
                        </section>

                        <section className="rounded-xl border border-border p-4">
                            <h2 className="text-lg font-semibold">Posts ({result.posts.total})</h2>
                            <ul className="mt-3 space-y-2">
                                {result.posts.items.map((item, idx) => {
                                    const value = asObject(item);
                                    const id = String(value.id ?? idx);
                                    const content = String(value.content ?? "Untitled post");
                                    return (
                                        <li key={`post-${id}`} className="text-sm">
                                            <Link className="text-primary hover:underline" to={`/post/${id}`}>
                                                {content.slice(0, 120)}
                                            </Link>
                                        </li>
                                    );
                                })}
                                {result.posts.items.length === 0 ? (
                                    <li className="text-sm text-muted-foreground">No posts found.</li>
                                ) : null}
                            </ul>
                        </section>
                    </div>
                ) : null}
            </main>
        </div>
    );
}
