const logger = require('../utils/logger');

// WebSocket event handlers
const setupWebSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.id} (${socket.user.email})`);

    // Join meeting room
    socket.on('meeting:join', async (data) => {
      try {
        const { meetingId } = data;
        socket.join(`meeting:${meetingId}`);
        
        // Notify others in the meeting
        socket.to(`meeting:${meetingId}`).emit('participant:joined', {
          userId: socket.user.id,
          displayName: `${socket.user.first_name} ${socket.user.last_name}`,
          timestamp: new Date().toISOString(),
        });

        socket.emit('meeting:joined', { meetingId });
        logger.info(`User ${socket.user.id} joined meeting ${meetingId}`);
      } catch (error) {
        logger.error('Meeting join error:', error);
        socket.emit('error', { message: 'Failed to join meeting' });
      }
    });

    // Leave meeting room
    socket.on('meeting:leave', async (data) => {
      try {
        const { meetingId } = data;
        socket.leave(`meeting:${meetingId}`);
        
        // Notify others in the meeting
        socket.to(`meeting:${meetingId}`).emit('participant:left', {
          userId: socket.user.id,
          displayName: `${socket.user.first_name} ${socket.user.last_name}`,
          timestamp: new Date().toISOString(),
        });

        logger.info(`User ${socket.user.id} left meeting ${meetingId}`);
      } catch (error) {
        logger.error('Meeting leave error:', error);
      }
    });

    // Handle audio stream for transcription (Week 2)
    socket.on('audio:stream', (data) => {
      const { meetingId, audioData, timestamp } = data;
      
      // Forward to AI service for processing (Week 2 implementation)
      socket.to(`meeting:${meetingId}`).emit('audio:received', {
        userId: socket.user.id,
        timestamp,
      });
      
      // TODO: Send to AI service for real-time transcription
      logger.debug(`Audio stream received from user ${socket.user.id} in meeting ${meetingId}`);
    });

    // Handle fake captions for Week 1 demo
    socket.on('caption:send', (data) => {
      const { meetingId, text, timestamp } = data;
      
      // Broadcast fake caption to all participants
      io.to(`meeting:${meetingId}`).emit('caption:received', {
        speakerId: socket.user.id,
        speakerName: `${socket.user.first_name} ${socket.user.last_name}`,
        text,
        timestamp,
        confidence: 0.95, // Fake confidence for demo
      });

      logger.debug(`Fake caption sent in meeting ${meetingId}: ${text}`);
    });

    // Handle WebRTC signaling
    socket.on('webrtc:offer', (data) => {
      const { meetingId, targetUserId, offer } = data;
      socket.to(`meeting:${meetingId}`).emit('webrtc:offer', {
        fromUserId: socket.user.id,
        targetUserId,
        offer,
      });
    });

    socket.on('webrtc:answer', (data) => {
      const { meetingId, targetUserId, answer } = data;
      socket.to(`meeting:${meetingId}`).emit('webrtc:answer', {
        fromUserId: socket.user.id,
        targetUserId,
        answer,
      });
    });

    socket.on('webrtc:ice-candidate', (data) => {
      const { meetingId, targetUserId, candidate } = data;
      socket.to(`meeting:${meetingId}`).emit('webrtc:ice-candidate', {
        fromUserId: socket.user.id,
        targetUserId,
        candidate,
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.user.id}`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${socket.user.id}:`, error);
    });
  });
};

module.exports = {
  setupWebSocketHandlers,
};
