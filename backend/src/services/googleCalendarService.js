const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = null;
    this.calendar = null;
    this.isConfigured = false;
  }

  /**
   * Initialize Google Calendar service with OAuth2 credentials
   */
  initialize(clientId, clientSecret, redirectUri) {
    if (!clientId || !clientSecret) {
      console.warn('Google Calendar credentials not provided');
      return;
    }

    this.oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    this.isConfigured = true;
    console.log('Google Calendar service initialized');
  }

  /**
   * Set access token for authenticated requests
   */
  setAccessToken(accessToken, refreshToken) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar service not configured');
    }

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }

  /**
   * Generate OAuth2 authorization URL
   */
  getAuthUrl() {
    if (!this.isConfigured) {
      throw new Error('Google Calendar service not configured');
    }

    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar service not configured');
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  /**
   * Create a new calendar event for a meeting
   */
  async createMeetingEvent(meetingData) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar service not configured');
    }

    const { title, description, startTime, endTime, attendees, location } = meetingData;

    const event = {
      summary: title,
      description: description || 'MeetingMind AI Assistant Meeting',
      start: {
        dateTime: startTime,
        timeZone: 'America/New_York', // TODO: Make this configurable
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/New_York',
      },
      attendees: attendees ? attendees.map(email => ({ email })) : [],
      location: location || 'MeetingMind Virtual Room',
      conferenceData: {
        createRequest: {
          requestId: `meetingmind-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 10 }, // 10 minutes before
        ],
      },
    };

    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all'
      });

      return {
        eventId: response.data.id,
        htmlLink: response.data.htmlLink,
        meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
        event: response.data
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  /**
   * Update existing calendar event with meeting summary
   */
  async updateEventWithSummary(eventId, meetingData) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar service not configured');
    }

    const { summary, actionItems, decisions, keyPoints } = meetingData;

    let description = `Meeting Summary:\n${summary}\n\n`;

    if (actionItems && actionItems.length > 0) {
      description += 'Action Items:\n';
      actionItems.forEach((item, index) => {
        description += `${index + 1}. ${item.text} (Assigned to: ${item.assignee || 'Unassigned'}, Priority: ${item.priority})\n`;
      });
      description += '\n';
    }

    if (decisions && decisions.length > 0) {
      description += 'Decisions Made:\n';
      decisions.forEach((decision, index) => {
        description += `${index + 1}. ${decision.text}\n`;
      });
      description += '\n';
    }

    if (keyPoints && keyPoints.length > 0) {
      description += 'Key Points:\n';
      keyPoints.forEach((point, index) => {
        description += `${index + 1}. ${point.text}\n`;
      });
    }

    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId: eventId,
        resource: {
          description: description
        },
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  /**
   * Get upcoming meetings from calendar
   */
  async getUpcomingMeetings(maxResults = 10) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar service not configured');
    }

    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items.map(event => ({
        id: event.id,
        title: event.summary,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
        attendees: event.attendees || [],
        location: event.location,
        htmlLink: event.htmlLink,
        meetLink: event.conferenceData?.entryPoints?.[0]?.uri
      }));
    } catch (error) {
      console.error('Error fetching upcoming meetings:', error);
      throw error;
    }
  }

  /**
   * Create follow-up event for action items review
   */
  async createFollowUpEvent(originalEventId, followUpDate, actionItems) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar service not configured');
    }

    // Get original event details
    const originalEvent = await this.calendar.events.get({
      calendarId: 'primary',
      eventId: originalEventId
    });

    const followUpTitle = `Follow-up: ${originalEvent.data.summary}`;
    const followUpDescription = `Action Items Review:\n\n${actionItems.map((item, index) => 
      `${index + 1}. ${item.text} (Assigned to: ${item.assignee || 'Unassigned'})`
    ).join('\n')}`;

    const event = {
      summary: followUpTitle,
      description: followUpDescription,
      start: {
        dateTime: followUpDate,
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: new Date(new Date(followUpDate).getTime() + 30 * 60000).toISOString(), // 30 minutes
        timeZone: 'America/New_York',
      },
      attendees: originalEvent.data.attendees || [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 }, // 1 hour before
          { method: 'popup', minutes: 10 }, // 10 minutes before
        ],
      },
    };

    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all'
      });

      return response.data;
    } catch (error) {
      console.error('Error creating follow-up event:', error);
      throw error;
    }
  }

  /**
   * Check if user has available time slot
   */
  async checkAvailability(startTime, endTime, attendeeEmails = []) {
    if (!this.isConfigured) {
      throw new Error('Google Calendar service not configured');
    }

    try {
      const response = await this.calendar.freebusy.query({
        resource: {
          timeMin: startTime,
          timeMax: endTime,
          items: [
            { id: 'primary' },
            ...attendeeEmails.map(email => ({ id: email }))
          ]
        }
      });

      const busyTimes = response.data.calendars;
      const conflicts = [];

      Object.keys(busyTimes).forEach(calendarId => {
        if (busyTimes[calendarId].busy.length > 0) {
          conflicts.push({
            calendar: calendarId,
            busyTimes: busyTimes[calendarId].busy
          });
        }
      });

      return {
        available: conflicts.length === 0,
        conflicts: conflicts
      };
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  }

  /**
   * Test Google Calendar connection
   */
  async testConnection() {
    if (!this.isConfigured) {
      throw new Error('Google Calendar service not configured');
    }

    try {
      const response = await this.calendar.calendarList.list();
      return {
        success: true,
        calendarsCount: response.data.items.length
      };
    } catch (error) {
      console.error('Google Calendar connection test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new GoogleCalendarService();
