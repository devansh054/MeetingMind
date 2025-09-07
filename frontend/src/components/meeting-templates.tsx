"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, Users, BarChart3, Lightbulb, Target, Calendar, Clock, Plus, Star, Copy } from "lucide-react"

interface MeetingTemplate {
  id: string
  name: string
  type: "standup" | "retrospective" | "brainstorm" | "review" | "planning" | "client"
  duration: number
  participants: number
  agenda: string[]
  description: string
  icon: any
  color: string
  isPopular?: boolean
}

interface MeetingTemplatesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MeetingTemplates({ open, onOpenChange }: MeetingTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<MeetingTemplate | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const templates: MeetingTemplate[] = [
    {
      id: "1",
      name: "Daily Standup",
      type: "standup",
      duration: 15,
      participants: 8,
      agenda: [
        "What did you accomplish yesterday?",
        "What are you working on today?",
        "Any blockers or impediments?",
        "Quick wins and celebrations",
      ],
      description: "Quick daily sync for agile teams to align on progress and blockers",
      icon: Users,
      color: "#4ecdc4",
      isPopular: true,
    },
    {
      id: "2",
      name: "Sprint Retrospective",
      type: "retrospective",
      duration: 60,
      participants: 6,
      agenda: [
        "What went well this sprint?",
        "What could be improved?",
        "Action items for next sprint",
        "Team appreciation and feedback",
      ],
      description: "Reflect on sprint performance and identify improvements",
      icon: BarChart3,
      color: "#ff6b6b",
    },
    {
      id: "3",
      name: "Brainstorming Session",
      type: "brainstorm",
      duration: 45,
      participants: 10,
      agenda: [
        "Problem statement and context",
        "Individual ideation (5 min)",
        "Idea sharing and clustering",
        "Voting and prioritization",
        "Next steps and ownership",
      ],
      description: "Creative ideation session with structured facilitation",
      icon: Lightbulb,
      color: "#feca57",
      isPopular: true,
    },
    {
      id: "4",
      name: "Quarterly Business Review",
      type: "review",
      duration: 90,
      participants: 12,
      agenda: [
        "Previous quarter performance review",
        "Key metrics and KPI analysis",
        "Challenges and lessons learned",
        "Next quarter goals and priorities",
        "Resource allocation and planning",
      ],
      description: "Comprehensive quarterly performance and planning review",
      icon: Target,
      color: "#45b7d1",
    },
    {
      id: "5",
      name: "Client Presentation",
      type: "client",
      duration: 60,
      participants: 8,
      agenda: [
        "Welcome and introductions",
        "Project status update",
        "Demo and deliverables review",
        "Feedback and Q&A session",
        "Next steps and timeline",
      ],
      description: "Professional client meeting with structured presentation flow",
      icon: FileText,
      color: "#96ceb4",
    },
    {
      id: "6",
      name: "Sprint Planning",
      type: "planning",
      duration: 120,
      participants: 8,
      agenda: [
        "Sprint goal definition",
        "Backlog refinement and estimation",
        "Capacity planning and commitment",
        "Task breakdown and assignment",
        "Risk assessment and mitigation",
      ],
      description: "Detailed sprint planning with capacity and commitment",
      icon: Calendar,
      color: "#ff9ff3",
    },
  ]

  const applyTemplate = (template: MeetingTemplate) => {
    console.log("[v0] Applying meeting template:", template.name)
    // Apply template to current meeting or create new meeting
    setSelectedTemplate(null)
  }

  const duplicateTemplate = (template: MeetingTemplate) => {
    console.log("[v0] Duplicating template:", template.name)
    // Create a copy of the template for customization
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong !w-[98vw] !h-[98vh] !max-w-none !max-h-none p-6">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Meeting Templates
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <Card className="glass">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Available Templates
                </CardTitle>
                <Button variant="outline" size="sm" className="bg-transparent" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-3 w-3 mr-1" />
                  Create
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Template Grid */}
              <div className="grid grid-cols-1 gap-3">
                {templates.map((template) => {
                  const IconComponent = template.icon
                  return (
                    <div
                      key={template.id}
                      className="p-3 border border-border rounded-lg hover:border-primary/50 transition-all cursor-pointer bg-muted/10"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${template.color}20` }}>
                          <IconComponent className="h-4 w-4" style={{ color: template.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            {template.isPopular && (
                              <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400">
                                <Star className="h-2 w-2 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {template.duration}m
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {template.participants} people
                            </span>
                            <span className="capitalize">{template.type}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0 bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation()
                              duplicateTemplate(template)
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Selected Template Details */}
              {selectedTemplate && (
                <div className="mt-4 p-4 border border-border rounded-lg bg-muted/10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{selectedTemplate.name}</h4>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="bg-transparent">
                        <Copy className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                      <Button variant="outline" size="sm" className="bg-transparent">
                        Customize
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Duration:</span>
                        <p className="font-medium">{selectedTemplate.duration} minutes</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Participants:</span>
                        <p className="font-medium">{selectedTemplate.participants} people</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium capitalize">{selectedTemplate.type}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-sm">Agenda:</span>
                      <ul className="mt-1 space-y-1">
                        {selectedTemplate.agenda.map((item, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="text-muted-foreground">{index + 1}.</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage Tips */}
          <Card className="glass mt-4">
            <CardHeader>
              <CardTitle className="text-base">Template Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Consistent meeting structure and flow</li>
                <li>• Reduced preparation time for recurring meetings</li>
                <li>• Built-in best practices and time management</li>
                <li>• Customizable for team-specific needs</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Create Custom Template Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="glass-strong">
            <DialogHeader>
              <DialogTitle>Create Custom Template</DialogTitle>
              <DialogDescription>Design a reusable meeting template for your team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Name</label>
                  <Input placeholder="e.g., Weekly Team Sync" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input type="number" placeholder="30" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Brief description of the meeting purpose" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Agenda Items</label>
                <Textarea placeholder="Enter agenda items (one per line)" className="min-h-[100px]" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  <Plus className="h-3 w-3 mr-1" />
                  Create Template
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}
