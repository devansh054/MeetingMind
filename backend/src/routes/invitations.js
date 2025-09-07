const express = require('express');
const router = express.Router();
const { sendMeetingInvitation, sendBulkInvitations } = require('../controllers/invitationController');
const { authenticateToken } = require('../middleware/auth');

// Send single meeting invitation
router.post('/send', authenticateToken, sendMeetingInvitation);

// Send bulk meeting invitations
router.post('/send-bulk', authenticateToken, sendBulkInvitations);

module.exports = router;
