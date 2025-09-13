const Redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.initializeRedis();
  }

  async initializeRedis() {
    try {
      // Use Redis if available, otherwise fallback to in-memory cache
      if (process.env.REDIS_URL) {
        this.client = Redis.createClient({
          url: process.env.REDIS_URL,
          retry_strategy: (options) => {
            if (options.error && options.error.code === 'ECONNREFUSED') {
              console.log('Redis connection refused, falling back to in-memory cache');
              return null;
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
              return new Error('Retry time exhausted');
            }
            return Math.min(options.attempt * 100, 3000);
          }
        });

        this.client.on('error', (err) => {
          console.error('Redis Client Error:', err);
          this.isConnected = false;
        });

        this.client.on('connect', () => {
          console.log('Connected to Redis');
          this.isConnected = true;
        });

        await this.client.connect();
      } else {
        console.log('Redis not configured, using in-memory cache');
        this.memoryCache = new Map();
        this.memoryCacheExpiry = new Map();
      }
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      this.memoryCache = new Map();
      this.memoryCacheExpiry = new Map();
    }
  }

  // Generate cache key
  generateKey(prefix, ...params) {
    return `${prefix}:${params.join(':')}`;
  }

  // Get data from cache
  async get(key) {
    try {
      if (this.client && this.isConnected) {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
      } else if (this.memoryCache) {
        const expiry = this.memoryCacheExpiry.get(key);
        if (expiry && Date.now() > expiry) {
          this.memoryCache.delete(key);
          this.memoryCacheExpiry.delete(key);
          return null;
        }
        return this.memoryCache.get(key) || null;
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Set data in cache
  async set(key, value, ttl = 3600) { // Default 1 hour
    try {
      if (this.client && this.isConnected) {
        await this.client.setEx(key, ttl, JSON.stringify(value));
      } else if (this.memoryCache) {
        this.memoryCache.set(key, value);
        this.memoryCacheExpiry.set(key, Date.now() + (ttl * 1000));
      }
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  // Delete data from cache
  async delete(key) {
    try {
      if (this.client && this.isConnected) {
        await this.client.del(key);
      } else if (this.memoryCache) {
        this.memoryCache.delete(key);
        this.memoryCacheExpiry.delete(key);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  // Delete multiple keys
  async deletePattern(pattern) {
    try {
      if (this.client && this.isConnected) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      } else if (this.memoryCache) {
        // For in-memory cache, we need to iterate through keys
        for (const key of this.memoryCache.keys()) {
          if (key.includes(pattern.replace('*', ''))) {
            this.memoryCache.delete(key);
            this.memoryCacheExpiry.delete(key);
          }
        }
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // Clear all cache
  async clear() {
    try {
      if (this.client && this.isConnected) {
        await this.client.flushAll();
      } else if (this.memoryCache) {
        this.memoryCache.clear();
        this.memoryCacheExpiry.clear();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Cache middleware for Express routes
  cache(ttl = 3600, keyGenerator = null) {
    return async (req, res, next) => {
      try {
        const key = keyGenerator ? keyGenerator(req) : this.generateKey(
          req.route.path,
          JSON.stringify(req.query),
          JSON.stringify(req.params)
        );

        const cached = await this.get(key);
        if (cached) {
          return res.json(cached);
        }

        // Store original res.json
        const originalJson = res.json;
        res.json = function(data) {
          // Cache the response
          cacheService.set(key, data, ttl);
          originalJson.call(this, data);
        };

        next();
      } catch (error) {
        console.error('Cache middleware error:', error);
        next();
      }
    };
  }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = cacheService;

