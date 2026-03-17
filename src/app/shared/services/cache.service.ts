import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private cache = new Map<string, CacheEntry<any>>();
    private observableCache = new Map<string, Observable<any>>();

    // Default TTL: 60 minutes (in milliseconds) - for category data that rarely changes
    private readonly DEFAULT_TTL = 60 * 60 * 1000;

    // Pattern registry for entity-based cache clearing
    private entityPatterns = new Map<string, RegExp>();

    constructor() {
        // Listen for Ctrl+F5 or manual refresh to clear cache
        window.addEventListener('beforeunload', () => {
            // Optional: Clear cache on page refresh
            // this.clearAll();
        });
    }

    /**
     * Get cached data or execute the source observable
     * @param key Unique cache key
     * @param source Observable to execute if cache miss
     * @param ttl Time to live in milliseconds (default: 60 minutes)
     */
    get<T>(key: string, source: Observable<T>, ttl: number = this.DEFAULT_TTL): Observable<T> {
        const cached = this.cache.get(key);
        const now = Date.now();

        // Check if cache exists and is still valid
        if (cached && (now - cached.timestamp) < ttl) {
            return of(cached.data);
        }

        // Check if there's an ongoing request for this key
        if (this.observableCache.has(key)) {
            return this.observableCache.get(key)!;
        }

        // Execute source and cache the result
        const shared = source.pipe(
            tap(data => {
                this.cache.set(key, {
                    data,
                    timestamp: now
                });
                this.observableCache.delete(key);
            }),
            shareReplay(1)
        );

        this.observableCache.set(key, shared);
        return shared;
    }

    /**
     * Set data directly to cache
     */
    set<T>(key: string, data: T): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    /**
     * Check if cache exists and is valid
     */
    has(key: string, ttl: number = this.DEFAULT_TTL): boolean {
        const cached = this.cache.get(key);
        if (!cached) return false;

        const now = Date.now();
        return (now - cached.timestamp) < ttl;
    }

    /**
     * Clear specific cache entry
     */
    clear(key: string): void {
        this.cache.delete(key);
        this.observableCache.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clearAll(): void {
        this.cache.clear();
        this.observableCache.clear();
    }

    /**
     * Clear cache entries matching a pattern
     */
    clearPattern(pattern: RegExp): void {
        const keysToDelete: string[] = [];

        this.cache.forEach((_, key) => {
            if (pattern.test(key)) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => {
            this.cache.delete(key);
            this.observableCache.delete(key);
        });
    }

    /**
     * Get cache statistics
     */
    getStats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * Register a regex pattern for a specific entity name
     */
    registerEntity(entityName: string, pattern: RegExp): void {
        this.entityPatterns.set(entityName, pattern);
    }

    /**
     * Clear cache for a specific entity based on registered pattern
     */
    clearByEntity(entityName: string): void {
        const pattern = this.entityPatterns.get(entityName);
        if (pattern) {
            this.clearPattern(pattern);
        }
    }


}
