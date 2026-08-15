/**
 * In-memory caching system for frequently accessed data
 * Reduces database queries and improves performance
 */

class CacheEntry {
  constructor(value, ttl = 300000) { // 5 minutes default
    this.value = value;
    this.ttl = ttl;
    this.createdAt = Date.now();
  }

  isExpired() {
    return Date.now() - this.createdAt > this.ttl;
  }
}

class Cache {
  constructor() {
    this.store = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0
    };
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  /**
   * Get value from cache
   */
  get(key) {
    const entry = this.store.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (entry.isExpired()) {
      this.store.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set value in cache
   */
  set(key, value, ttl = 300000) {
    this.store.set(key, new CacheEntry(value, ttl));
    this.stats.sets++;
  }

  /**
   * Delete value from cache
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.store.clear();
    this.stats = { hits: 0, misses: 0, sets: 0 };
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    let removed = 0;
    for (const [key, entry] of this.store.entries()) {
      if (entry.isExpired()) {
        this.store.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      console.log(`[Cache] Cleaned up ${removed} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) + '%' : 'N/A',
      size: this.store.size
    };
  }

  /**
   * Destroy cache
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Singleton cache instance
const cache = new Cache();

/**
 * Cache key generator
 */
const cacheKeys = {
  drivers: () => 'drivers:all',
  driver: (id) => `driver:${id}`,
  races: () => 'races:all',
  race: (id) => `race:${id}`,
  driverStandings: () => 'standings:drivers',
  constructorStandings: () => 'standings:constructors',
  simulation: () => 'championship:simulation',
  leaderboard: (limit = 10) => `leaderboard:${limit}`,
  predictions: (userId) => `predictions:${userId}`,
  raceResults: () => 'race:results:all'
};

/**
 * Cache middleware decorator
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in ms
 * @returns {Function} Middleware
 */
function cacheMiddleware(key, ttl = 300000) {
  return (req, res, next) => {
    const cachedData = cache.get(key);

    if (cachedData) {
      return res.json(cachedData);
    }

    const originalJson = res.json;
    res.json = function (data) {
      cache.set(key, data, ttl);
      return originalJson.call(this, data);
    };

    next();
  };
}

/**
 * Invalidate cache keys
 */
function invalidateCache(...keys) {
  keys.forEach((key) => {
    if (typeof key === 'function') {
      cache.delete(key());
    } else {
      cache.delete(key);
    }
  });
}

/**
 * Batch invalidation for related caches
 */
const invalidationPatterns = {
  onRaceSubmitted: () => {
    invalidateCache(
      cacheKeys.raceResults,
      cacheKeys.driverStandings,
      cacheKeys.constructorStandings,
      cacheKeys.simulation
    );
  },
  onPredictionSubmitted: (userId) => {
    invalidateCache(
      cacheKeys.predictions(userId),
      cacheKeys.leaderboard
    );
  },
  onDataRefresh: () => {
    cache.clear();
  }
};

module.exports = {
  cache,
  cacheKeys,
  cacheMiddleware,
  invalidateCache,
  invalidationPatterns,
  Cache
};
