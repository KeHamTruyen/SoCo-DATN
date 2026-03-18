type CacheValue<T> = {
    value: T;
    updatedAt: number;
};

class SimpleQueryCache {
    private cache = new Map<string, CacheValue<unknown>>();

    get<T>(key: string) {
        return this.cache.get(key) as CacheValue<T> | undefined;
    }

    set<T>(key: string, value: T) {
        this.cache.set(key, { value, updatedAt: Date.now() });
    }

    invalidate(prefix: string) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.cache.delete(key);
            }
        }
    }
}

export const queryClient = new SimpleQueryCache();

