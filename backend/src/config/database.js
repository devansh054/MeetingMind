const { Pool } = require('pg');
const redis = require('redis');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis connection
const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Initialize connections
const initializeDatabase = async () => {
  try {
    // Test PostgreSQL connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    client.release();

    // Connect to Redis
    await redisClient.connect();
    
    return { pool, redisClient };
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

module.exports = {
  pool,
  redisClient,
  initializeDatabase,
};
