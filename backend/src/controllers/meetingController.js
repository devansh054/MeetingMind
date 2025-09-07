const Joi = require('joi');
const Meeting = require('../models/Meeting');
const logger = require('../utils/logger');

// Validation schemas
const createMeetingSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).allow(''),
  scheduledStart: Joi.date().iso(),
  recordingEnabled: Joi.boolean().default(true),
  transcriptEnabled: Joi.boolean().default(true),
  aiInsightsEnabled: Joi.boolean().default(true),
});

const updateMeetingSchema = Joi.object({
  title: Joi.string().min(1).max(255),
  description: Joi.string().max(1000).allow(''),
  scheduledStart: Joi.date().iso(),
  status: Joi.string().valid('scheduled', 'active', 'ended', 'cancelled'),
  recordingEnabled: Joi.boolean(),
  transcriptEnabled: Joi.boolean(),
  aiInsightsEnabled: Joi.boolean(),
});

const addParticipantSchema = Joi.object({
  displayName: Joi.string().min(1).max(100).required(),
  email: Joi.string().email(),
  role: Joi.string().valid('host', 'participant', 'observer').default('participant'),
});

// Create new meeting
const createMeeting = async (req, res) => {
  try {
    const { error, value } = createMeetingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const meeting = await Meeting.create({
      ...value,
      hostId: req.user.id,
    });

    // Add host as participant
    await Meeting.addParticipant(meeting.id, {
      userId: req.user.id,
      displayName: `${req.user.first_name} ${req.user.last_name}`,
      email: req.user.email,
      role: 'host',
    });

    logger.info(`Meeting created: ${meeting.id} by user: ${req.user.id}`);

    res.status(201).json({
      message: 'Meeting created successfully',
      meeting,
    });
  } catch (error) {
    logger.error('Create meeting error:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
};

// Get meeting by ID
const getMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Get participants
    const participants = await Meeting.getParticipants(id);

    res.json({
      meeting: {
        ...meeting,
        participants,
      },
    });
  } catch (error) {
    logger.error('Get meeting error:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
};

// Get user's meetings
const getUserMeetings = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const meetings = await Meeting.findByHostId(req.user.id, parseInt(limit), offset);

    res.json({
      meetings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: meetings.length === parseInt(limit),
      },
    });
  } catch (error) {
    logger.error('Get user meetings error:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

// Update meeting
const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateMeetingSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user is host
    const existingMeeting = await Meeting.findById(id);
    if (!existingMeeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    if (existingMeeting.host_id !== req.user.id) {
      return res.status(403).json({ error: 'Only meeting host can update meeting' });
    }

    const updatedMeeting = await Meeting.updateStatus(id, value.status || existingMeeting.status, value);

    logger.info(`Meeting updated: ${id} by user: ${req.user.id}`);

    res.json({
      message: 'Meeting updated successfully',
      meeting: updatedMeeting,
    });
  } catch (error) {
    logger.error('Update meeting error:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
};

// Start meeting
const startMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.host_id !== req.user.id) {
      return res.status(403).json({ error: 'Only meeting host can start meeting' });
    }

    if (meeting.status === 'active') {
      return res.status(400).json({ error: 'Meeting is already active' });
    }

    const updatedMeeting = await Meeting.updateStatus(id, 'active');

    // Emit to all participants via WebSocket
    req.io.to(`meeting:${id}`).emit('meeting:started', {
      meetingId: id,
      startedAt: updatedMeeting.actual_start,
    });

    logger.info(`Meeting started: ${id}`);

    res.json({
      message: 'Meeting started successfully',
      meeting: updatedMeeting,
    });
  } catch (error) {
    logger.error('Start meeting error:', error);
    res.status(500).json({ error: 'Failed to start meeting' });
  }
};

// End meeting
const endMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.host_id !== req.user.id) {
      return res.status(403).json({ error: 'Only meeting host can end meeting' });
    }

    if (meeting.status === 'ended') {
      return res.status(400).json({ error: 'Meeting is already ended' });
    }

    const updatedMeeting = await Meeting.updateStatus(id, 'ended');

    // Emit to all participants via WebSocket
    req.io.to(`meeting:${id}`).emit('meeting:ended', {
      meetingId: id,
      endedAt: updatedMeeting.actual_end,
    });

    logger.info(`Meeting ended: ${id}`);

    res.json({
      message: 'Meeting ended successfully',
      meeting: updatedMeeting,
    });
  } catch (error) {
    logger.error('End meeting error:', error);
    res.status(500).json({ error: 'Failed to end meeting' });
  }
};

// Add participant to meeting
const addParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = addParticipantSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const participant = await Meeting.addParticipant(id, {
      userId: req.user.id,
      ...value,
    });

    // Emit to meeting room
    req.io.to(`meeting:${id}`).emit('participant:joined', {
      meetingId: id,
      participant,
    });

    res.status(201).json({
      message: 'Participant added successfully',
      participant,
    });
  } catch (error) {
    logger.error('Add participant error:', error);
    res.status(500).json({ error: 'Failed to add participant' });
  }
};

// Delete meeting
const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedMeeting = await Meeting.delete(id, req.user.id);
    if (!deletedMeeting) {
      return res.status(404).json({ error: 'Meeting not found or unauthorized' });
    }

    logger.info(`Meeting deleted: ${id} by user: ${req.user.id}`);

    res.json({
      message: 'Meeting deleted successfully',
    });
  } catch (error) {
    logger.error('Delete meeting error:', error);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
};

module.exports = {
  createMeeting,
  getMeeting,
  getUserMeetings,
  updateMeeting,
  startMeeting,
  endMeeting,
  addParticipant,
  deleteMeeting,
};
