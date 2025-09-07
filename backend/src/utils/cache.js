const { redisClient, isRedisAvailable } = require('../config/database');

/**
 * Cache utility that gracefully handles Redis unavailability
 */
class CacheService {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<string|null>} - Cached value or null
   */
  async get(key) {
    if (!isRedisAvailable()) {
      return null;
    }
    
    try {
      return await redisClient.get(key);
    } catch (error) {
      console.warn('Cache get failed:', error.message);
      return null;
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {string} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = 3600) {
    if (!isRedisAvailable()) {
      return false;
    }
    
    try {
      if (ttl) {
        await redisClient.setEx(key, ttl, value);
      } else {
        await redisClient.set(key, value);
      }
      return true;
    } catch (error) {
      console.warn('Cache set failed:', error.message);
      return false;
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    if (!isRedisAvailable()) {
      return false;
    }
    
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.warn('Cache delete failed:', error.message);
      return false;
    }
  }

  /**
   * Check if cache is available
   * @returns {boolean} - Cache availability status
   */
  isAvailable() {
    return isRedisAvailable();
  }
}

module.exports = new CacheService();
