const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis connection (optional for demo)
let redisClient = null;
let redisAvailable = false;

const initializeRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log('Redis URL not configured - running without Redis cache');
    return null;
  }

  try {
    const redis = require('redis');
    redisClient = redis.createClient({
      url: process.env.REDIS_URL,
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
      redisAvailable = false;
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
      redisAvailable = true;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('Redis connection failed, continuing without cache:', error.message);
    redisClient = null;
    redisAvailable = false;
    return null;
  }
};

// Initialize connections
const initializeDatabase = async () => {
  try {
    // Test PostgreSQL connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    client.release();

    // Try to connect to Redis (optional)
    await initializeRedis();
    
    return { pool, redisClient };
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Helper function to check if Redis is available
const isRedisAvailable = () => redisAvailable && redisClient;

module.exports = {
  pool,
  redisClient,
  initializeDatabase,
  isRedisAvailable,
};
