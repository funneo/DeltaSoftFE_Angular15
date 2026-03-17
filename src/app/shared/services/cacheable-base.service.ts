import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service';

/**
 * Base class for services that support caching
 * Extend this class to automatically get cache support
 */
export abstract class CacheableBaseService {
    protected abstract cacheService: CacheService;
    protected abstract cacheKeyPrefix: string;

    /**
     * Get data with cache support
     * @param key Cache key suffix (will be prefixed with cacheKeyPrefix)
     * @param source Observable source
     * @param useCache Whether to use cache
     * @param ttl Time to live in milliseconds
     */
    protected getCached<T>(
        key: string,
        source: Observable<T>,
        useCache: boolean = true,
        ttl?: number
    ): Observable<T> {
        const cacheKey = `${this.cacheKeyPrefix}_${key}`;

        if (useCache) {
            return this.cacheService.get(cacheKey, source, ttl);
        }
        return source;
    }

    /**
     * Clear specific cache entry
     */
    protected clearCacheEntry(key: string): void {
        const cacheKey = `${this.cacheKeyPrefix}_${key}`;
        this.cacheService.clear(cacheKey);
    }

    /**
     * Clear all cache entries for this service
     */
    clearCache(): void {
        this.cacheService.clearPattern(new RegExp(`^${this.cacheKeyPrefix}_`));
    }

    /**
     * Wrap an observable to auto-clear cache on success
     */
    protected withCacheClear<T>(source: Observable<T>, cacheKey?: string): Observable<T> {
        return source.pipe(
            tap((response: any) => {
                if (response?.code == '200' || response?.code == '201') {
                    if (cacheKey) {
                        this.clearCacheEntry(cacheKey);
                    } else {
                        this.clearCache();
                    }
                }
            })
        );
    }
}
