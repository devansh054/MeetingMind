"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Zap,
  CheckCircle2,
  Clock,
  Calendar,
  Target,
  Settings,
  Plus,
  Send,
  ExternalLink,
  AlertTriangle,
} from "lucide-react"

interface ActionItem {
  id: string
  title: string
  description: string
  assignee: string
  assigneeAvatar: string
  dueDate: string
  priority: "high" | "medium" | "low"
  status: "pending" | "in-progress" | "completed"
  source: "ai-detected" | "manual"
  confidence?: number
  integrations: string[]
}

interface Integration {
  id: string
  name: string
  icon: string
  connected: boolean
  type: "project-management" | "calendar" | "communication"
}

interface FollowUpAutomationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function FollowUpAutomation({ open, onOpenChange }: FollowUpAutomationProps) {
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: "1",
      title: "Update mobile app wireframes",
      description: "Incorporate user feedback from usability testing session",
      assignee: "Sarah Chen",
      assigneeAvatar: "/professional-woman-diverse.png",
      dueDate: "2024-01-15",
      priority: "high",
      status: "pending",
      source: "ai-detected",
      confidence: 94,
      integrations: ["asana", "slack"],
    },
    {
      id: "2",
      title: "Schedule infrastructure review meeting",
      description: "Discuss migration timeline and resource requirements",
      assignee: "Marcus Johnson",
      assigneeAvatar: "/professional-man.png",
      dueDate: "2024-01-12",
      priority: "medium",
      status: "pending",
      source: "ai-detected",
      confidence: 87,
      integrations: ["calendar", "teams"],
    },
    {
      id: "3",
      title: "Prepare Q1 marketing budget proposal",
      description: "Include ROI analysis and channel performance data",
      assignee: "Elena Rodriguez",
      assigneeAvatar: "/professional-woman-diverse.png",
      dueDate: "2024-01-18",
      priority: "high",
      status: "in-progress",
      source: "manual",
      integrations: ["notion", "slack"],
    },
  ])

  const [integrations] = useState<Integration[]>([
    { id: "asana", name: "Asana", icon: "🎯", connected: true, type: "project-management" },
    { id: "trello", name: "Trello", icon: "📋", connected: false, type: "project-management" },
    { id: "jira", name: "Jira", icon: "🔧", connected: true, type: "project-management" },
    { id: "calendar", name: "Google Calendar", icon: "📅", connected: true, type: "calendar" },
    { id: "slack", name: "Slack", icon: "💬", connected: true, type: "communication" },
    { id: "teams", name: "Microsoft Teams", icon: "👥", connected: true, type: "communication" },
    { id: "notion", name: "Notion", icon: "📝", connected: true, type: "project-management" },
  ])

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-600 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "in-progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "pending":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      default:
        return "bg-slate-600 text-white"
    }
  }

  const processSelectedItems = () => {
    setIsProcessing(true)
    setTimeout(() => {
      console.log("[v0] Processing action items:", selectedItems)
      setIsProcessing(false)
      setSelectedItems([])
    }, 2000)
  }

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[98vw] !h-[98vh] !max-w-none !max-h-none overflow-y-auto glass-strong border border-white/20">
        <DialogHeader className="pb-4 border-b border-white/20">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Follow-up Automation
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <Card className="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  Action Items Management
                </CardTitle>
          <div className="flex items-center gap-2">
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Plus className="h-3 w-3 mr-1" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong">
                <DialogHeader>
                  <DialogTitle>Create Action Item</DialogTitle>
                  <DialogDescription>Add a new follow-up task with automation</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Task Title</Label>
                    <Input id="task-title" placeholder="Enter task title..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Input id="task-description" placeholder="Task description..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Assignee</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sarah">Sarah Chen</SelectItem>
                          <SelectItem value="marcus">Marcus Johnson</SelectItem>
                          <SelectItem value="elena">Elena Rodriguez</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due-date">Due Date</Label>
                      <Input id="due-date" type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1" onClick={() => setShowCreateDialog(false)}>
                      Create & Automate
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={() => setShowCreateDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Action Items ({actionItems.length})</h4>
            {selectedItems.length > 0 && (
              <Button
                size="sm"
                onClick={processSelectedItems}
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-3 w-3 mr-1" />
                {isProcessing ? "Processing..." : `Process ${selectedItems.length} items`}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {actionItems.map((item) => (
              <div key={item.id} className="p-3 border border-border rounded-lg bg-muted/10">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleItemSelection(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-sm">{item.title}</h5>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.source === "ai-detected" && item.confidence && (
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400">
                            AI {item.confidence}%
                          </Badge>
                        )}
                        <Badge variant="outline" className={getPriorityColor(item.priority)}>
                          {item.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={item.assigneeAvatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {item.assignee
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{item.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.dueDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.integrations.map((integration) => {
                          const integ = integrations.find((i) => i.id === integration)
                          return integ ? (
                            <Badge key={integration} variant="outline" className="text-xs">
                              {integ.icon} {integ.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Status */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Connected Integrations
          </h4>

          <div className="grid grid-cols-2 gap-2">
            {integrations.map((integration) => (
              <div key={integration.id} className="flex items-center gap-2 p-2 bg-muted/10 rounded">
                <span className="text-sm">{integration.icon}</span>
                <span className="text-xs flex-1">{integration.name}</span>
                <Badge
                  variant="outline"
                  className={
                    integration.connected
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-red-500/20 text-red-400 border-red-500/30"
                  }
                >
                  {integration.connected ? "Connected" : "Disconnected"}
                </Badge>
                {integration.connected && (
                  <Button variant="outline" size="sm" className="h-5 w-5 p-0 bg-transparent">
                    <ExternalLink className="h-2 w-2" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Automation Rules */}
        <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-3 w-3 text-primary" />
            Active Automation Rules
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Auto-create Asana tasks for high-priority action items</li>
            <li>• Send Slack notifications to assignees within 1 hour</li>
            <li>• Add calendar reminders 24 hours before due date</li>
            <li>• Generate follow-up meeting if tasks are overdue</li>
          </ul>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <CheckCircle2 className="h-4 w-4 mx-auto mb-1 text-green-400" />
            <div className="text-sm font-medium">87%</div>
            <div className="text-xs text-muted-foreground">Completion Rate</div>
          </div>
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <Clock className="h-4 w-4 mx-auto mb-1 text-blue-400" />
            <div className="text-sm font-medium">2.3 days</div>
            <div className="text-xs text-muted-foreground">Avg. Completion</div>
          </div>
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
            <div className="text-sm font-medium">3</div>
            <div className="text-xs text-muted-foreground">Overdue Tasks</div>
          </div>
        </div>
      </CardContent>
    </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
