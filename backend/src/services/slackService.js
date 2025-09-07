// const { WebClient } = require('@slack/web-api');

class SlackService {
  constructor() {
    this.client = null;
    this.isConfigured = false;
  }

  /**
   * Initialize Slack client with bot token
   */
  initialize(botToken) {
    if (!botToken) {
      console.warn('Slack bot token not provided');
      return;
    }

    // this.client = new WebClient(botToken);
    this.isConfigured = true;
    console.log('Slack service initialized');
  }

  /**
   * Post meeting summary to a Slack channel
   */
  async postMeetingSummary(channelId, meetingData) {
    if (!this.isConfigured) {
      throw new Error('Slack service not configured');
    }

    const { title, summary, actionItems, decisions, keyPoints, participants, duration } = meetingData;
    
    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📝 Meeting Summary: ${title}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Duration:* ${this.formatDuration(duration)}\n*Participants:* ${participants.join(', ')}`
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Summary:*\n${summary}`
        }
      }
    ];

    // Add action items section
    if (actionItems && actionItems.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🎯 Action Items:*'
        }
      });

      actionItems.forEach((item, index) => {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${index + 1}. ${item.text}\n   *Assigned to:* ${item.assignee || 'Unassigned'} | *Priority:* ${item.priority}`
          }
        });
      });
    }

    // Add decisions section
    if (decisions && decisions.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*✅ Decisions Made:*'
        }
      });

      decisions.forEach((decision, index) => {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${index + 1}. ${decision.text}`
          }
        });
      });
    }

    // Add key points section
    if (keyPoints && keyPoints.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*🔑 Key Points:*'
        }
      });

      keyPoints.forEach((point, index) => {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `${index + 1}. ${point.text}`
          }
        });
      });
    }

    try {
      const result = await this.client.chat.postMessage({
        channel: channelId,
        blocks: blocks,
        text: `Meeting Summary: ${title}` // Fallback text for notifications
      });

      return result;
    } catch (error) {
      console.error('Error posting to Slack:', error);
      throw error;
    }
  }

  /**
   * Post action items reminder to Slack channel
   */
  async postActionItemsReminder(channelId, actionItems, meetingTitle) {
    if (!this.isConfigured) {
      throw new Error('Slack service not configured');
    }

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `⏰ Action Items Reminder: ${meetingTitle}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Here are the action items from your recent meeting:'
        }
      }
    ];

    actionItems.forEach((item, index) => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${index + 1}. ${item.text}\n   *Assigned to:* ${item.assignee || 'Unassigned'} | *Priority:* ${item.priority}`
        }
      });
    });

    try {
      const result = await this.client.chat.postMessage({
        channel: channelId,
        blocks: blocks,
        text: `Action Items Reminder: ${meetingTitle}`
      });

      return result;
    } catch (error) {
      console.error('Error posting action items reminder to Slack:', error);
      throw error;
    }
  }

  /**
   * Send direct message to user with their assigned action items
   */
  async sendPersonalActionItems(userId, actionItems, meetingTitle) {
    if (!this.isConfigured) {
      throw new Error('Slack service not configured');
    }

    const userActionItems = actionItems.filter(item => 
      item.assignee && item.assignee.toLowerCase().includes(userId.toLowerCase())
    );

    if (userActionItems.length === 0) {
      return null; // No action items for this user
    }

    const blocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📋 Your Action Items: ${meetingTitle}`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'You have been assigned the following action items:'
        }
      }
    ];

    userActionItems.forEach((item, index) => {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${index + 1}. ${item.text}\n   *Priority:* ${item.priority}`
        }
      });
    });

    try {
      const result = await this.client.chat.postMessage({
        channel: userId,
        blocks: blocks,
        text: `Your Action Items: ${meetingTitle}`
      });

      return result;
    } catch (error) {
      console.error('Error sending personal action items to Slack:', error);
      throw error;
    }
  }

  /**
   * Get list of channels the bot has access to
   */
  async getChannels() {
    if (!this.isConfigured) {
      throw new Error('Slack service not configured');
    }

    try {
      const result = await this.client.conversations.list({
        types: 'public_channel,private_channel'
      });

      return result.channels.map(channel => ({
        id: channel.id,
        name: channel.name,
        isPrivate: channel.is_private
      }));
    } catch (error) {
      console.error('Error fetching Slack channels:', error);
      throw error;
    }
  }

  /**
   * Format duration in minutes to human readable format
   */
  formatDuration(durationMs) {
    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Test Slack connection
   */
  async testConnection() {
    if (!this.isConfigured) {
      throw new Error('Slack service not configured');
    }

    try {
      const result = await this.client.auth.test();
      return {
        success: true,
        botId: result.bot_id,
        teamName: result.team,
        userId: result.user_id
      };
    } catch (error) {
      console.error('Slack connection test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SlackService();
