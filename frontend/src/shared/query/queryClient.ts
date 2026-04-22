import { QueryClient } from "@tanstack/react-query";
import { HttpError } from "../api/httpClient";

export const appQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry(failureCount, error) {
                if (error instanceof HttpError && error.status >= 400 && error.status < 500) {
                    return false;
                }
                return failureCount < 2;
            },
            refetchOnWindowFocus: false,
        },
        mutations: {
            retry: 1,
        },
    },
});
