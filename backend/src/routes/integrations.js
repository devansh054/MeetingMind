const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const integrationsController = require('../controllers/integrationsController');

const router = express.Router();

// All integration routes require authentication
router.use(authenticateToken);

// General integration routes
router.get('/status', integrationsController.getIntegrationStatus);
router.post('/initialize', integrationsController.initializeIntegrations);
router.get('/test', integrationsController.testConnections);
router.post('/auto-post', integrationsController.autoPostMeetingSummary);

// Slack integration routes
router.post('/slack/post-summary', integrationsController.postToSlack);
router.post('/slack/send-reminder', integrationsController.sendSlackReminder);
router.get('/slack/channels', integrationsController.getSlackChannels);

// Google Calendar integration routes
router.post('/calendar/create-event', integrationsController.createCalendarEvent);
router.post('/calendar/update-event', integrationsController.updateCalendarEvent);
router.get('/calendar/upcoming', integrationsController.getUpcomingMeetings);
router.post('/calendar/check-availability', integrationsController.checkAvailability);

// Email integration routes
router.post('/email/send-summary', integrationsController.sendMeetingSummaryEmail);
router.post('/email/send-action-items', integrationsController.sendActionItemsEmail);
router.post('/email/send-followup', integrationsController.sendFollowUpEmail);

// Notion integration routes
router.post('/notion/create-meeting', integrationsController.createNotionMeetingPage);
router.post('/notion/create-action-items', integrationsController.createNotionActionItems);
router.post('/notion/update-action-item', integrationsController.updateNotionActionItem);
router.get('/notion/search-meetings', integrationsController.searchNotionMeetings);
router.get('/notion/action-items/:assignee', integrationsController.getNotionActionItemsByAssignee);

module.exports = router;
