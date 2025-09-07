import React, { useState, useEffect } from 'react';
import { Settings, Check, X, ExternalLink, Mail, Calendar, MessageSquare, FileText } from 'lucide-react';

interface IntegrationConfig {
  slack?: {
    enabled: boolean;
    botToken?: string;
    channelId?: string;
    autoPost: boolean;
  };
  googleCalendar?: {
    enabled: boolean;
    clientId?: string;
    clientSecret?: string;
    autoUpdate: boolean;
  };
  email?: {
    enabled: boolean;
    service?: string;
    user?: string;
    autoSend: boolean;
    recipients: string[];
  };
  notion?: {
    enabled: boolean;
    apiKey?: string;
    databaseIds?: {
      meetings?: string;
      actionItems?: string;
    };
    autoCreate: boolean;
  };
}

interface IntegrationsPanelProps {
  meetingId: string;
  onIntegrationUpdate?: (config: IntegrationConfig) => void;
}

const IntegrationsPanel: React.FC<IntegrationsPanelProps> = ({ meetingId, onIntegrationUpdate }) => {
  const [config, setConfig] = useState<IntegrationConfig>({
    slack: { enabled: false, autoPost: false },
    googleCalendar: { enabled: false, autoUpdate: false },
    email: { enabled: false, autoSend: false, recipients: [] },
    notion: { enabled: false, autoCreate: false }
  });
  const [connectionStatus, setConnectionStatus] = useState<Record<string, boolean>>({});
  const [isTestingConnections, setIsTestingConnections] = useState(false);
  const [showConfig, setShowConfig] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrationConfig();
  }, []);

  const loadIntegrationConfig = async () => {
    try {
      const response = await fetch('/api/integrations/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config || config);
      }
    } catch (error) {
      console.error('Error loading integration config:', error);
    }
  };

  const testConnections = async () => {
    setIsTestingConnections(true);
    try {
      const response = await fetch('/api/integrations/test', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const status: Record<string, boolean> = {};
        Object.keys(data.results).forEach(service => {
          status[service] = data.results[service].success;
        });
        setConnectionStatus(status);
      }
    } catch (error) {
      console.error('Error testing connections:', error);
    } finally {
      setIsTestingConnections(false);
    }
  };

  const updateConfig = (service: keyof IntegrationConfig, updates: any) => {
    const newConfig = {
      ...config,
      [service]: { ...config[service], ...updates }
    };
    setConfig(newConfig);
    onIntegrationUpdate?.(newConfig);
  };

  const saveConfig = async () => {
    try {
      const response = await fetch('/api/integrations/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        await testConnections();
      }
    } catch (error) {
      console.error('Error saving integration config:', error);
    }
  };

  const triggerAutoPost = async (meetingData: any) => {
    try {
      const response = await fetch('/api/integrations/auto-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          meetingData,
          integrationSettings: config
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Auto-post results:', data.results);
      }
    } catch (error) {
      console.error('Error auto-posting:', error);
    }
  };

  const IntegrationCard = ({ 
    title, 
    icon: Icon, 
    service, 
    description, 
    configFields 
  }: {
    title: string;
    icon: any;
    service: keyof IntegrationConfig;
    description: string;
    configFields: React.ReactNode;
  }) => {
    const isEnabled = config[service]?.enabled || false;
    const isConnected = connectionStatus[service] || false;

    return (
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isEnabled && (
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            )}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => updateConfig(service, { enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        {isEnabled && (
          <div className="space-y-3 pt-3 border-t">
            {configFields}
            <button
              onClick={() => setShowConfig(showConfig === service ? null : service)}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              {showConfig === service ? 'Hide Settings' : 'Show Settings'}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Integrations</h3>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={testConnections}
              disabled={isTestingConnections}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
            >
              {isTestingConnections ? 'Testing...' : 'Test All'}
            </button>
            <button
              onClick={saveConfig}
              className="text-sm bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <IntegrationCard
          title="Slack"
          icon={MessageSquare}
          service="slack"
          description="Auto-post meeting summaries to Slack channels"
          configFields={
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.slack?.autoPost || false}
                  onChange={(e) => updateConfig('slack', { autoPost: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Auto-post summaries</span>
              </label>
              {showConfig === 'slack' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Bot Token"
                    value={config.slack?.botToken || ''}
                    onChange={(e) => updateConfig('slack', { botToken: e.target.value })}
                    className="w-full text-sm border rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="Channel ID"
                    value={config.slack?.channelId || ''}
                    onChange={(e) => updateConfig('slack', { channelId: e.target.value })}
                    className="w-full text-sm border rounded px-2 py-1"
                  />
                </div>
              )}
            </div>
          }
        />

        <IntegrationCard
          title="Google Calendar"
          icon={Calendar}
          service="googleCalendar"
          description="Create events and update with meeting summaries"
          configFields={
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.googleCalendar?.autoUpdate || false}
                  onChange={(e) => updateConfig('googleCalendar', { autoUpdate: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Auto-update events</span>
              </label>
              {showConfig === 'googleCalendar' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Client ID"
                    value={config.googleCalendar?.clientId || ''}
                    onChange={(e) => updateConfig('googleCalendar', { clientId: e.target.value })}
                    className="w-full text-sm border rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="Client Secret"
                    value={config.googleCalendar?.clientSecret || ''}
                    onChange={(e) => updateConfig('googleCalendar', { clientSecret: e.target.value })}
                    className="w-full text-sm border rounded px-2 py-1"
                  />
                </div>
              )}
            </div>
          }
        />

        <IntegrationCard
          title="Email"
          icon={Mail}
          service="email"
          description="Send meeting summaries and action item reminders"
          configFields={
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.email?.autoSend || false}
                  onChange={(e) => updateConfig('email', { autoSend: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Auto-send summaries</span>
              </label>
              {showConfig === 'email' && (
                <div className="space-y-2">
                  <select
                    value={config.email?.service || ''}
                    onChange={(e) => updateConfig('email', { service: e.target.value })}
                    className="w-full text-sm border rounded px-2 py-1"
                  >
                    <option value="">Select Email Service</option>
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Outlook</option>
                    <option value="custom">Custom SMTP</option>
                  </select>
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={config.email?.user || ''}
                    onChange={(e) => updateConfig('email', { user: e.target.value })}
                    className="w-full text-sm border rounded px-2 py-1"
                  />
                  <textarea
                    placeholder="Recipients (comma-separated)"
                    value={config.email?.recipients?.join(', ') || ''}
                    onChange={(e) => updateConfig('email', { recipients: e.target.value.split(',').map(s => s.trim()) })}
                    className="w-full text-sm border rounded px-2 py-1 h-16"
                  />
                </div>
              )}
            </div>
          }
        />

        <IntegrationCard
          title="Notion"
          icon={FileText}
          service="notion"
          description="Create meeting pages and action item databases"
          configFields={
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={config.notion?.autoCreate || false}
                  onChange={(e) => updateConfig('notion', { autoCreate: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm">Auto-create pages</span>
              </label>
              {showConfig === 'notion' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="API Key"
                    value={config.notion?.apiKey || ''}
                    onChange={(e) => updateConfig('notion', { apiKey: e.target.value })}
                    className="w-full text-sm border rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    placeholder="Meetings Database ID"
                    value={config.notion?.databaseIds?.meetings || ''}
                    onChange={(e) => updateConfig('notion', { 
                      databaseIds: { 
                        ...config.notion?.databaseIds, 
                        meetings: e.target.value 
                      }
                    })}
                    className="w-full text-sm border rounded px-2 py-1"
                  />
                </div>
              )}
            </div>
          }
        />

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border p-4">
          <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button
              onClick={() => triggerAutoPost({ 
                title: 'Test Meeting',
                summary: 'This is a test meeting summary',
                actionItems: [],
                participants: ['Test User']
              })}
              className="w-full text-left text-sm bg-primary-50 text-primary-700 p-2 rounded hover:bg-primary-100"
            >
              📤 Test Auto-Post to All Services
            </button>
            <button
              onClick={testConnections}
              className="w-full text-left text-sm bg-gray-50 text-gray-700 p-2 rounded hover:bg-gray-100"
            >
              🔍 Test All Connections
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPanel;
