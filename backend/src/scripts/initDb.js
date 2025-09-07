const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Initializing database schema...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../../db/init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Database schema initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    // Don't throw error - let app continue even if tables already exist
  } finally {
    await pool.end();
  }
}

module.exports = { initializeDatabase };
