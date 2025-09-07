"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Code, Plus, Copy, Trash2, TestTube, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react"

interface APIKey {
  id: string
  name: string
  key: string
  permissions: string[]
  created: string
  lastUsed: string
  status: "active" | "inactive"
}

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  secret: string
  status: "active" | "inactive"
  lastTriggered: string
  successRate: number
}

export default function APIWebhooks() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: "1",
      name: "Production API",
      key: "mk_live_abc123...",
      permissions: ["meetings.read", "meetings.write", "transcripts.read"],
      created: "2024-01-01",
      lastUsed: "2 hours ago",
      status: "active",
    },
    {
      id: "2",
      name: "Development API",
      key: "mk_test_def456...",
      permissions: ["meetings.read", "transcripts.read"],
      created: "2024-01-05",
      lastUsed: "1 day ago",
      status: "active",
    },
  ])

  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([
    {
      id: "1",
      name: "Slack Integration",
      url: "https://hooks.slack.com/services/...",
      events: ["meeting.started", "meeting.ended", "transcript.ready"],
      secret: "whsec_abc123...",
      status: "active",
      lastTriggered: "5 minutes ago",
      successRate: 98.5,
    },
    {
      id: "2",
      name: "CRM Sync",
      url: "https://api.company.com/webhooks/meetings",
      events: ["meeting.created", "meeting.ended"],
      secret: "whsec_def456...",
      status: "active",
      lastTriggered: "1 hour ago",
      successRate: 95.2,
    },
  ])

  const [showCreateAPI, setShowCreateAPI] = useState(false)
  const [showCreateWebhook, setShowCreateWebhook] = useState(false)

  const availableEvents = [
    "meeting.created",
    "meeting.started",
    "meeting.ended",
    "meeting.updated",
    "participant.joined",
    "participant.left",
    "transcript.ready",
    "recording.ready",
    "action_item.created",
    "ai_insight.generated",
  ]

  const availablePermissions = [
    "meetings.read",
    "meetings.write",
    "meetings.delete",
    "transcripts.read",
    "transcripts.write",
    "recordings.read",
    "recordings.write",
    "analytics.read",
    "webhooks.manage",
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const testWebhook = (webhookId: string) => {
    console.log("[v0] Testing webhook:", webhookId)
    // Send test webhook
  }

  const revokeAPIKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
  }

  const deleteWebhook = (webhookId: string) => {
    setWebhooks((prev) => prev.filter((webhook) => webhook.id !== webhookId))
  }

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-red-500/20 text-red-400 border-red-500/30"
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Code className="h-4 w-4 text-primary" />
            API & Webhooks
          </CardTitle>
          <Badge variant="outline" className="bg-primary/20 text-primary">
            Developer Tools
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="api-keys" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">API Keys</h4>
              <Dialog open={showCreateAPI} onOpenChange={setShowCreateAPI}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Plus className="h-3 w-3 mr-1" />
                    Create Key
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-strong">
                  <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                    <DialogDescription>Generate a new API key for your application</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="key-name">Key Name</Label>
                      <Input id="key-name" placeholder="Enter a descriptive name..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {availablePermissions.map((permission) => (
                          <div key={permission} className="flex items-center gap-2">
                            <input type="checkbox" id={permission} />
                            <Label htmlFor={permission} className="text-xs">
                              {permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1" onClick={() => setShowCreateAPI(false)}>
                        Generate Key
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setShowCreateAPI(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="p-4 border border-border rounded-lg bg-muted/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-sm">{apiKey.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted/30 px-2 py-1 rounded">{apiKey.key}</code>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-5 w-5 p-0 bg-transparent"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(apiKey.status)}>
                        {apiKey.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 bg-transparent"
                        onClick={() => revokeAPIKey(apiKey.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium">Created:</span> {apiKey.created}
                    </div>
                    <div>
                      <span className="font-medium">Last Used:</span> {apiKey.lastUsed}
                    </div>
                  </div>

                  <div className="mt-2">
                    <span className="text-xs font-medium">Permissions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {apiKey.permissions.map((permission) => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Webhook Endpoints</h4>
              <Dialog open={showCreateWebhook} onOpenChange={setShowCreateWebhook}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Webhook
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-strong">
                  <DialogHeader>
                    <DialogTitle>Create Webhook</DialogTitle>
                    <DialogDescription>Configure a new webhook endpoint</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-name">Webhook Name</Label>
                      <Input id="webhook-name" placeholder="Enter webhook name..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">Endpoint URL</Label>
                      <Input id="webhook-url" placeholder="https://your-app.com/webhooks" />
                    </div>
                    <div className="space-y-2">
                      <Label>Events</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {availableEvents.map((event) => (
                          <div key={event} className="flex items-center gap-2">
                            <input type="checkbox" id={event} />
                            <Label htmlFor={event} className="text-xs">
                              {event}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="flex-1" onClick={() => setShowCreateWebhook(false)}>
                        Create Webhook
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        onClick={() => setShowCreateWebhook(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="p-4 border border-border rounded-lg bg-muted/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-sm">{webhook.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted/30 px-2 py-1 rounded">{webhook.url}</code>
                        <Button variant="outline" size="sm" className="h-5 w-5 p-0 bg-transparent">
                          <ExternalLink className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(webhook.status)}>
                        {webhook.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 bg-transparent"
                        onClick={() => testWebhook(webhook.id)}
                      >
                        <TestTube className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 w-6 p-0 bg-transparent"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs mb-2">
                    <div>
                      <span className="font-medium">Last Triggered:</span> {webhook.lastTriggered}
                    </div>
                    <div>
                      <span className="font-medium">Success Rate:</span>{" "}
                      <span className="text-green-400">{webhook.successRate}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium">Events:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="secondary" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium">Secret:</span>
                      <code className="text-xs bg-muted/30 px-2 py-1 rounded ml-2">{webhook.secret}</code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="docs" className="space-y-4">
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg bg-muted/10">
                <h4 className="font-medium mb-2">API Documentation</h4>
                <p className="text-sm text-muted-foreground mb-3">Complete API reference with examples and SDKs</p>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View Docs
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-border rounded-lg bg-muted/10">
                  <h5 className="font-medium text-sm mb-1">REST API</h5>
                  <p className="text-xs text-muted-foreground mb-2">Full CRUD operations for meetings and data</p>
                  <code className="text-xs bg-muted/30 px-2 py-1 rounded">GET /api/v1/meetings</code>
                </div>
                <div className="p-3 border border-border rounded-lg bg-muted/10">
                  <h5 className="font-medium text-sm mb-1">WebSocket API</h5>
                  <p className="text-xs text-muted-foreground mb-2">Real-time events and live data streams</p>
                  <code className="text-xs bg-muted/30 px-2 py-1 rounded">wss://api.meetingmind.com/ws</code>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium">Quick Start Example</h5>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <code className="text-xs">
                    <div>curl -X GET \</div>
                    <div className="ml-2">https://api.meetingmind.com/v1/meetings \</div>
                    <div className="ml-2">-H "Authorization: Bearer YOUR_API_KEY" \</div>
                    <div className="ml-2">-H "Content-Type: application/json"</div>
                  </code>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-medium">SDKs Available</h5>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                    JavaScript
                  </Badge>
                  <Badge variant="outline" className="bg-green-500/20 text-green-400">
                    Python
                  </Badge>
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-400">
                    PHP
                  </Badge>
                  <Badge variant="outline" className="bg-orange-500/20 text-orange-400">
                    Go
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">API & Webhook Logs</h4>
              <Select defaultValue="24h">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="p-3 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="font-medium text-sm">POST /api/v1/meetings</span>
                  </div>
                  <span className="text-xs text-muted-foreground">2 minutes ago</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-medium">Status:</span> 201 Created
                  </div>
                  <div>
                    <span className="font-medium">Response Time:</span> 245ms
                  </div>
                  <div>
                    <span className="font-medium">API Key:</span> mk_live_abc123...
                  </div>
                </div>
              </div>

              <div className="p-3 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="font-medium text-sm">Webhook: meeting.started</span>
                  </div>
                  <span className="text-xs text-muted-foreground">5 minutes ago</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-medium">Endpoint:</span> Slack Integration
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 200 OK
                  </div>
                  <div>
                    <span className="font-medium">Retry:</span> 0/3
                  </div>
                </div>
              </div>

              <div className="p-3 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium text-sm">GET /api/v1/transcripts/123</span>
                  </div>
                  <span className="text-xs text-muted-foreground">10 minutes ago</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-medium">Status:</span> 429 Rate Limited
                  </div>
                  <div>
                    <span className="font-medium">Response Time:</span> 12ms
                  </div>
                  <div>
                    <span className="font-medium">API Key:</span> mk_test_def456...
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-sm font-medium">1,247</div>
                <div className="text-xs text-muted-foreground">API Calls</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-sm font-medium">98.5%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-sm font-medium">156ms</div>
                <div className="text-xs text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-sm font-medium">23</div>
                <div className="text-xs text-muted-foreground">Webhooks Sent</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
