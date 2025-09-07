const { Client } = require('@notionhq/client');

class NotionService {
  constructor() {
    this.notion = null;
    this.isConfigured = false;
    this.databaseIds = {
      meetings: null,
      actionItems: null,
      decisions: null
    };
  }

  /**
   * Initialize Notion service with API key
   */
  initialize(apiKey, databaseIds = {}) {
    if (!apiKey) {
      console.warn('Notion API key not provided');
      return;
    }

    this.notion = new Client({ auth: apiKey });
    this.databaseIds = { ...this.databaseIds, ...databaseIds };
    this.isConfigured = true;
    console.log('Notion service initialized');
  }

  /**
   * Create a new meeting page in Notion
   */
  async createMeetingPage(meetingData) {
    if (!this.isConfigured) {
      throw new Error('Notion service not configured');
    }

    const { title, summary, actionItems, decisions, keyPoints, participants, duration, date } = meetingData;

    const properties = {
      'Meeting Title': {
        title: [
          {
            text: {
              content: title
            }
          }
        ]
      },
      'Date': {
        date: {
          start: new Date(date).toISOString().split('T')[0]
        }
      },
      'Duration': {
        number: Math.floor(duration / (1000 * 60)) // Convert to minutes
      },
      'Participants': {
        multi_select: participants.map(participant => ({
          name: participant
        }))
      },
      'Status': {
        select: {
          name: 'Completed'
        }
      }
    };

    // Build page content
    const children = [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '📋 Meeting Summary'
              }
            }
          ]
        }
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: summary
              }
            }
          ]
        }
      }
    ];

    // Add action items section
    if (actionItems && actionItems.length > 0) {
      children.push(
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: '🎯 Action Items'
                }
              }
            ]
          }
        }
      );

      actionItems.forEach(item => {
        children.push({
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: `${item.text} (Assigned to: ${item.assignee || 'Unassigned'}, Priority: ${item.priority})`
                }
              }
            ],
            checked: false
          }
        });
      });
    }

    // Add decisions section
    if (decisions && decisions.length > 0) {
      children.push(
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: '✅ Decisions Made'
                }
              }
            ]
          }
        }
      );

      decisions.forEach(decision => {
        children.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: decision.text
                }
              }
            ]
          }
        });
      });
    }

    // Add key points section
    if (keyPoints && keyPoints.length > 0) {
      children.push(
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: '🔑 Key Points'
                }
              }
            ]
          }
        }
      );

      keyPoints.forEach(point => {
        children.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: point.text
                }
              }
            ]
          }
        });
      });
    }

    try {
      const response = await this.notion.pages.create({
        parent: this.databaseIds.meetings ? 
          { database_id: this.databaseIds.meetings } : 
          { page_id: await this.getOrCreateMeetingsPage() },
        properties,
        children
      });

      return {
        pageId: response.id,
        url: response.url,
        page: response
      };
    } catch (error) {
      console.error('Error creating Notion meeting page:', error);
      throw error;
    }
  }

  /**
   * Create individual action item pages in Notion
   */
  async createActionItemPages(actionItems, meetingTitle, meetingPageId) {
    if (!this.isConfigured) {
      throw new Error('Notion service not configured');
    }

    const createdPages = [];

    for (const item of actionItems) {
      const properties = {
        'Action Item': {
          title: [
            {
              text: {
                content: item.text
              }
            }
          ]
        },
        'Assignee': {
          rich_text: [
            {
              text: {
                content: item.assignee || 'Unassigned'
              }
            }
          ]
        },
        'Priority': {
          select: {
            name: item.priority.charAt(0).toUpperCase() + item.priority.slice(1)
          }
        },
        'Status': {
          select: {
            name: 'Not Started'
          }
        },
        'Meeting': {
          relation: meetingPageId ? [{ id: meetingPageId }] : []
        },
        'Due Date': item.dueDate ? {
          date: {
            start: new Date(item.dueDate).toISOString().split('T')[0]
          }
        } : undefined
      };

      // Remove undefined properties
      Object.keys(properties).forEach(key => {
        if (properties[key] === undefined) {
          delete properties[key];
        }
      });

      try {
        const response = await this.notion.pages.create({
          parent: this.databaseIds.actionItems ? 
            { database_id: this.databaseIds.actionItems } : 
            { page_id: await this.getOrCreateActionItemsPage() },
          properties
        });

        createdPages.push({
          actionItem: item,
          pageId: response.id,
          url: response.url
        });
      } catch (error) {
        console.error('Error creating action item page:', error);
      }
    }

    return createdPages;
  }

  /**
   * Update action item status in Notion
   */
  async updateActionItemStatus(pageId, status, notes = '') {
    if (!this.isConfigured) {
      throw new Error('Notion service not configured');
    }

    const properties = {
      'Status': {
        select: {
          name: status
        }
      }
    };

    if (notes) {
      properties['Notes'] = {
        rich_text: [
          {
            text: {
              content: notes
            }
          }
        ]
      };
    }

    try {
      const response = await this.notion.pages.update({
        page_id: pageId,
        properties
      });

      return response;
    } catch (error) {
      console.error('Error updating action item status:', error);
      throw error;
    }
  }

  /**
   * Create a meeting template page
   */
  async createMeetingTemplate(templateData) {
    if (!this.isConfigured) {
      throw new Error('Notion service not configured');
    }

    const { name, agenda, defaultParticipants, estimatedDuration } = templateData;

    const properties = {
      'Template Name': {
        title: [
          {
            text: {
              content: name
            }
          }
        ]
      },
      'Type': {
        select: {
          name: 'Template'
        }
      },
      'Estimated Duration': {
        number: estimatedDuration || 60
      }
    };

    const children = [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '📋 Meeting Agenda'
              }
            }
          ]
        }
      }
    ];

    // Add agenda items
    if (agenda && agenda.length > 0) {
      agenda.forEach(item => {
        children.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: item
                }
              }
            ]
          }
        });
      });
    }

    // Add default participants section
    if (defaultParticipants && defaultParticipants.length > 0) {
      children.push(
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: '👥 Default Participants'
                }
              }
            ]
          }
        }
      );

      defaultParticipants.forEach(participant => {
        children.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: participant
                }
              }
            ]
          }
        });
      });
    }

    try {
      const response = await this.notion.pages.create({
        parent: { page_id: await this.getOrCreateTemplatesPage() },
        properties,
        children
      });

      return {
        templateId: response.id,
        url: response.url
      };
    } catch (error) {
      console.error('Error creating meeting template:', error);
      throw error;
    }
  }

  /**
   * Get or create meetings database/page
   */
  async getOrCreateMeetingsPage() {
    // This would typically create a database or return a parent page ID
    // For now, we'll return a placeholder
    return 'meetings-parent-page-id';
  }

  /**
   * Get or create action items database/page
   */
  async getOrCreateActionItemsPage() {
    return 'action-items-parent-page-id';
  }

  /**
   * Get or create templates page
   */
  async getOrCreateTemplatesPage() {
    return 'templates-parent-page-id';
  }

  /**
   * Search for existing meeting pages
   */
  async searchMeetings(query, limit = 10) {
    if (!this.isConfigured) {
      throw new Error('Notion service not configured');
    }

    try {
      const response = await this.notion.search({
        query,
        filter: {
          property: 'object',
          value: 'page'
        },
        page_size: limit
      });

      return response.results.map(page => ({
        id: page.id,
        title: page.properties?.['Meeting Title']?.title?.[0]?.text?.content || 'Untitled',
        url: page.url,
        lastEdited: page.last_edited_time
      }));
    } catch (error) {
      console.error('Error searching meetings:', error);
      throw error;
    }
  }

  /**
   * Get action items assigned to a specific person
   */
  async getActionItemsByAssignee(assignee) {
    if (!this.isConfigured || !this.databaseIds.actionItems) {
      throw new Error('Notion service or action items database not configured');
    }

    try {
      const response = await this.notion.databases.query({
        database_id: this.databaseIds.actionItems,
        filter: {
          property: 'Assignee',
          rich_text: {
            contains: assignee
          }
        }
      });

      return response.results.map(page => ({
        id: page.id,
        title: page.properties?.['Action Item']?.title?.[0]?.text?.content || 'Untitled',
        assignee: page.properties?.['Assignee']?.rich_text?.[0]?.text?.content,
        priority: page.properties?.['Priority']?.select?.name,
        status: page.properties?.['Status']?.select?.name,
        dueDate: page.properties?.['Due Date']?.date?.start,
        url: page.url
      }));
    } catch (error) {
      console.error('Error fetching action items by assignee:', error);
      throw error;
    }
  }

  /**
   * Create a database for meetings if it doesn't exist
   */
  async createMeetingsDatabase(parentPageId) {
    if (!this.isConfigured) {
      throw new Error('Notion service not configured');
    }

    const databaseProperties = {
      'Meeting Title': {
        title: {}
      },
      'Date': {
        date: {}
      },
      'Duration': {
        number: {
          format: 'number'
        }
      },
      'Participants': {
        multi_select: {
          options: []
        }
      },
      'Status': {
        select: {
          options: [
            { name: 'Scheduled', color: 'blue' },
            { name: 'In Progress', color: 'yellow' },
            { name: 'Completed', color: 'green' },
            { name: 'Cancelled', color: 'red' }
          ]
        }
      }
    };

    try {
      const response = await this.notion.databases.create({
        parent: {
          page_id: parentPageId
        },
        title: [
          {
            type: 'text',
            text: {
              content: 'Meetings'
            }
          }
        ],
        properties: databaseProperties
      });

      this.databaseIds.meetings = response.id;
      return response;
    } catch (error) {
      console.error('Error creating meetings database:', error);
      throw error;
    }
  }

  /**
   * Test Notion connection
   */
  async testConnection() {
    if (!this.isConfigured) {
      throw new Error('Notion service not configured');
    }

    try {
      const response = await this.notion.users.me();
      return {
        success: true,
        user: response.name || response.id
      };
    } catch (error) {
      console.error('Notion connection test failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new NotionService();
