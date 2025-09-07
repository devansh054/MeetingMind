const slackService = require('../services/slackService');
const googleCalendarService = require('../services/googleCalendarService');
const emailService = require('../services/emailService');
const notionService = require('../services/notionService');

/**
 * Get integration status
 */
const getIntegrationStatus = async (req, res) => {
  try {
    const status = {
      slack: !!(process.env.SLACK_CLIENT_ID && process.env.SLACK_CLIENT_SECRET),
      googleCalendar: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      email: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      notion: !!(process.env.NOTION_CLIENT_ID && process.env.NOTION_CLIENT_SECRET)
    };

    res.json(status);
  } catch (error) {
    console.error('Error getting integration status:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Initialize all integration services
 */
const initializeIntegrations = async (req, res) => {
  try {
    const config = req.body;

    // Initialize Slack
    if (config.slack?.botToken) {
      slackService.initialize(config.slack.botToken);
    }

    // Initialize Google Calendar
    if (config.googleCalendar?.clientId && config.googleCalendar?.clientSecret) {
      googleCalendarService.initialize(
        config.googleCalendar.clientId,
        config.googleCalendar.clientSecret,
        config.googleCalendar.redirectUri
      );
    }

    // Initialize Email Service
    if (config.email) {
      emailService.initialize(config.email);
      await emailService.loadTemplates();
    }

    // Initialize Notion
    if (config.notion?.apiKey) {
      notionService.initialize(config.notion.apiKey, config.notion.databaseIds);
    }

    res.json({ 
      success: true, 
      message: 'Integration services initialized',
      services: {
        slack: !!config.slack?.botToken,
        googleCalendar: !!(config.googleCalendar?.clientId && config.googleCalendar?.clientSecret),
        email: !!config.email?.user,
        notion: !!config.notion?.apiKey
      }
    });
  } catch (error) {
    console.error('Error initializing integrations:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Test all integration connections
 */
const testConnections = async (req, res) => {
  try {
    const results = {};

    // Test Slack
    try {
      results.slack = await slackService.testConnection();
    } catch (error) {
      results.slack = { success: false, error: error.message };
    }

    // Test Google Calendar
    try {
      results.googleCalendar = await googleCalendarService.testConnection();
    } catch (error) {
      results.googleCalendar = { success: false, error: error.message };
    }

    // Test Email
    try {
      results.email = await emailService.testConnection();
    } catch (error) {
      results.email = { success: false, error: error.message };
    }

    // Test Notion
    try {
      results.notion = await notionService.testConnection();
    } catch (error) {
      results.notion = { success: false, error: error.message };
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error testing connections:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Post meeting summary to Slack
 */
const postToSlack = async (req, res) => {
  try {
    const { channelId, meetingData } = req.body;

    if (!channelId || !meetingData) {
      return res.status(400).json({ error: 'Channel ID and meeting data are required' });
    }

    const result = await slackService.postMeetingSummary(channelId, meetingData);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error posting to Slack:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send action items reminder to Slack
 */
const sendSlackReminder = async (req, res) => {
  try {
    const { channelId, actionItems, meetingTitle } = req.body;

    if (!channelId || !actionItems || !meetingTitle) {
      return res.status(400).json({ error: 'Channel ID, action items, and meeting title are required' });
    }

    const result = await slackService.postActionItemsReminder(channelId, actionItems, meetingTitle);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending Slack reminder:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get Slack channels
 */
const getSlackChannels = async (req, res) => {
  try {
    const channels = await slackService.getChannels();
    res.json({ success: true, channels });
  } catch (error) {
    console.error('Error fetching Slack channels:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create Google Calendar event
 */
const createCalendarEvent = async (req, res) => {
  try {
    const meetingData = req.body;

    if (!meetingData.title || !meetingData.startTime || !meetingData.endTime) {
      return res.status(400).json({ error: 'Title, start time, and end time are required' });
    }

    const result = await googleCalendarService.createMeetingEvent(meetingData);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update calendar event with meeting summary
 */
const updateCalendarEvent = async (req, res) => {
  try {
    const { eventId, meetingData } = req.body;

    if (!eventId || !meetingData) {
      return res.status(400).json({ error: 'Event ID and meeting data are required' });
    }

    const result = await googleCalendarService.updateEventWithSummary(eventId, meetingData);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get upcoming meetings from Google Calendar
 */
const getUpcomingMeetings = async (req, res) => {
  try {
    const { maxResults = 10 } = req.query;
    const meetings = await googleCalendarService.getUpcomingMeetings(parseInt(maxResults));
    res.json({ success: true, meetings });
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check calendar availability
 */
const checkAvailability = async (req, res) => {
  try {
    const { startTime, endTime, attendees } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'Start time and end time are required' });
    }

    const result = await googleCalendarService.checkAvailability(startTime, endTime, attendees);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send meeting summary email
 */
const sendMeetingSummaryEmail = async (req, res) => {
  try {
    const { recipients, meetingData } = req.body;

    if (!recipients || !meetingData) {
      return res.status(400).json({ error: 'Recipients and meeting data are required' });
    }

    const result = await emailService.sendMeetingSummary(recipients, meetingData);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending meeting summary email:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send action items reminder email
 */
const sendActionItemsEmail = async (req, res) => {
  try {
    const { recipient, actionItems, meetingData } = req.body;

    if (!recipient || !actionItems || !meetingData) {
      return res.status(400).json({ error: 'Recipient, action items, and meeting data are required' });
    }

    const result = await emailService.sendActionItemsReminder(recipient, actionItems, meetingData);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending action items email:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send follow-up email
 */
const sendFollowUpEmail = async (req, res) => {
  try {
    const { recipients, meetingData, additionalNotes } = req.body;

    if (!recipients || !meetingData) {
      return res.status(400).json({ error: 'Recipients and meeting data are required' });
    }

    const result = await emailService.sendFollowUpEmail(recipients, meetingData, additionalNotes);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending follow-up email:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create meeting page in Notion
 */
const createNotionMeetingPage = async (req, res) => {
  try {
    const meetingData = req.body;

    if (!meetingData.title || !meetingData.summary) {
      return res.status(400).json({ error: 'Title and summary are required' });
    }

    const result = await notionService.createMeetingPage(meetingData);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error creating Notion meeting page:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create action item pages in Notion
 */
const createNotionActionItems = async (req, res) => {
  try {
    const { actionItems, meetingTitle, meetingPageId } = req.body;

    if (!actionItems || !meetingTitle) {
      return res.status(400).json({ error: 'Action items and meeting title are required' });
    }

    const result = await notionService.createActionItemPages(actionItems, meetingTitle, meetingPageId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error creating Notion action items:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update action item status in Notion
 */
const updateNotionActionItem = async (req, res) => {
  try {
    const { pageId, status, notes } = req.body;

    if (!pageId || !status) {
      return res.status(400).json({ error: 'Page ID and status are required' });
    }

    const result = await notionService.updateActionItemStatus(pageId, status, notes);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error updating Notion action item:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Search meetings in Notion
 */
const searchNotionMeetings = async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const result = await notionService.searchMeetings(query, parseInt(limit));
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error searching Notion meetings:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get action items by assignee from Notion
 */
const getNotionActionItemsByAssignee = async (req, res) => {
  try {
    const { assignee } = req.params;

    if (!assignee) {
      return res.status(400).json({ error: 'Assignee is required' });
    }

    const result = await notionService.getActionItemsByAssignee(assignee);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error fetching action items by assignee:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Auto-post meeting summary to all configured integrations
 */
const autoPostMeetingSummary = async (req, res) => {
  try {
    const { meetingData, integrationSettings } = req.body;

    if (!meetingData) {
      return res.status(400).json({ error: 'Meeting data is required' });
    }

    const results = {};

    // Post to Slack if configured
    if (integrationSettings?.slack?.enabled && integrationSettings.slack.channelId) {
      try {
        results.slack = await slackService.postMeetingSummary(
          integrationSettings.slack.channelId, 
          meetingData
        );
      } catch (error) {
        results.slack = { error: error.message };
      }
    }

    // Create Notion page if configured
    if (integrationSettings?.notion?.enabled) {
      try {
        results.notion = await notionService.createMeetingPage(meetingData);
      } catch (error) {
        results.notion = { error: error.message };
      }
    }

    // Send email summary if configured
    if (integrationSettings?.email?.enabled && integrationSettings.email.recipients) {
      try {
        results.email = await emailService.sendMeetingSummary(
          integrationSettings.email.recipients, 
          meetingData
        );
      } catch (error) {
        results.email = { error: error.message };
      }
    }

    // Update calendar event if configured
    if (integrationSettings?.googleCalendar?.enabled && integrationSettings.googleCalendar.eventId) {
      try {
        results.googleCalendar = await googleCalendarService.updateEventWithSummary(
          integrationSettings.googleCalendar.eventId, 
          meetingData
        );
      } catch (error) {
        results.googleCalendar = { error: error.message };
      }
    }

    res.json({ success: true, results });
  } catch (error) {
    console.error('Error auto-posting meeting summary:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getIntegrationStatus,
  initializeIntegrations,
  testConnections,
  postToSlack,
  sendSlackReminder,
  getSlackChannels,
  createCalendarEvent,
  updateCalendarEvent,
  getUpcomingMeetings,
  checkAvailability,
  sendMeetingSummaryEmail,
  sendActionItemsEmail,
  sendFollowUpEmail,
  createNotionMeetingPage,
  createNotionActionItems,
  updateNotionActionItem,
  searchNotionMeetings,
  getNotionActionItemsByAssignee,
  autoPostMeetingSummary
};
