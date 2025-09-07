const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { initializeDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const meetingRoutes = require('./routes/meetings');
const analyticsRoutes = require('./routes/analytics');
const integrationRoutes = require('./routes/integrations');
const invitationRoutes = require('./routes/invitations');
const { authenticateSocket } = require('./middleware/auth');
const { attachSocketIO } = require('./middleware/socketMiddleware');
const { setupWebSocketHandlers } = require('./services/websocket');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: config.corsOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());

// CORS middleware with origin whitelist
app.use(cors({
  origin: (origin, callback) => {
    console.log('CORS origin check - Origin:', origin, 'Allowed:', config.corsOrigins);
    if (!origin || config.corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  optionsSuccessStatus: 200
}));

// Additional CORS headers middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log('CORS Debug - Origin:', origin, 'Allowed origins:', config.corsOrigins);
  
  if (config.corsOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    console.log('CORS Debug - Setting Access-Control-Allow-Origin to:', origin);
  } else {
    console.log('CORS Debug - Origin not in allowed list');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With');
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    service: 'MeetingMind Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      meetings: '/api/meetings',
      analytics: '/api/analytics',
      integrations: '/api/integrations'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Attach Socket.IO to requests
app.use(attachSocketIO(io));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/invitations', invitationRoutes);

// WebSocket authentication and handlers
io.use(authenticateSocket);
setupWebSocketHandlers(io);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: config.nodeEnv === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database connections
    await initializeDatabase();
    
    server.listen(config.port, () => {
      logger.info(`MeetingMind API server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

startServer();

module.exports = { app, io };
