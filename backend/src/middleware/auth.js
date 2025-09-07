const jwt = require('jsonwebtoken');
const config = require('../config');
const { pool } = require('../config/database');
const logger = require('../utils/logger');

// JWT authentication middleware for HTTP requests
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Fetch user from database
    const result = await pool.query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Socket.io authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Fetch user from database
    const result = await pool.query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return next(new Error('User not found'));
    }

    socket.user = result.rows[0];
    next();
  } catch (error) {
    logger.error('Socket authentication error:', error);
    next(new Error('Invalid or expired token'));
  }
};

// Optional authentication (for public endpoints)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret);
      const result = await pool.query(
        'SELECT id, email, first_name, last_name FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  authenticateSocket,
  optionalAuth,
};
