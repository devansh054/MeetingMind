const express = require('express');
const { 
  createMeeting, 
  getMeeting, 
  getUserMeetings, 
  updateMeeting, 
  startMeeting, 
  endMeeting, 
  addParticipant, 
  deleteMeeting 
} = require('../controllers/meetingController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All meeting routes require authentication
router.use(authenticateToken);

// Meeting CRUD
router.post('/', createMeeting);
router.get('/', getUserMeetings);
router.get('/:id', getMeeting);
router.put('/:id', updateMeeting);
router.delete('/:id', deleteMeeting);

// Meeting actions
router.post('/:id/start', startMeeting);
router.post('/:id/end', endMeeting);
router.post('/:id/participants', addParticipant);

module.exports = router;
