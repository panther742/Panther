interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class ApiClient {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, Promise<any>>();
  private maxCacheSize = 120;

  private getCacheKey(endpoint: string, body?: any): string {
    if (!body) return endpoint;
    try {
      return `${endpoint}:${JSON.stringify(body)}`;
    } catch {
      return `${endpoint}:${String(body)}`;
    }
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
      }
    }
    if (this.cache.size > this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
  }

  public getFromCache<T>(cacheKey: string): T | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(cacheKey);
      return null;
    }
    return entry.data as T;
  }

  public setCache<T>(cacheKey: string, data: T, ttlMs = 10 * 60 * 1000): void {
    this.cleanCache();
    this.cache.set(cacheKey, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  public async fetchWithCache<T>(
    endpoint: string,
    options: RequestInit = {},
    ttlMs = 10 * 60 * 1000,
    retries = 1,
    timeoutMs = 30000
  ): Promise<T> {
    const method = options.method || 'GET';
    const bodyStr = options.body ? String(options.body) : undefined;
    const cacheKey = `${method}:${endpoint}:${bodyStr || ''}`;

    // 1. Check Cache for GET or idempotent POST
    if (method === 'GET' || method === 'POST') {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // 2. Request Deduplication: Reuse pending promise if identical request is in flight
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // 3. Execute Fetch with timeout and auto-retry
    const executeFetch = async (attemptsLeft: number): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(endpoint, {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(errData.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as T;

        // Cache successful response (ttlMs = 0 disables caching for one-shot operations)
        if (ttlMs > 0) {
          this.setCache(cacheKey, data, ttlMs);
        }
        return data;
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (attemptsLeft > 0 && err.name !== 'AbortError') {
          console.warn(`[ApiClient] Retrying request to ${endpoint}... (${attemptsLeft} left)`);
          return executeFetch(attemptsLeft - 1);
        }
        if (err.name === 'AbortError') {
          const abortErr = new Error(
            `Request to ${endpoint} timed out after ${Math.round(timeoutMs / 1000)}s. The AI engine may still be processing — please try again or check your provider keys.`
          );
          (abortErr as any).name = 'AbortError';
          throw abortErr;
        }
        throw err;
      }
    };

    const requestPromise = executeFetch(retries).finally(() => {
      this.pendingRequests.delete(cacheKey);
    });

    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }
}

export const apiClient = new ApiClient();
