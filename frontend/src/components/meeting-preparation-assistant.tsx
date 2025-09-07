"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Brain,
  FileText,
  Users,
  Clock,
  Target,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Plus,
  Copy,
  RefreshCw,
} from "lucide-react"

interface TalkingPoint {
  id: string
  category: "agenda" | "question" | "update" | "decision"
  content: string
  priority: "high" | "medium" | "low"
  source: string
  confidence: number
}

interface ParticipantInsight {
  id: string
  name: string
  avatar: string
  role: string
  expertise: string[]
  recentActivity: string
  suggestedTopics: string[]
  lastInteraction: string
}

interface MeetingPreparationAssistantProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function MeetingPreparationAssistant({ open, onOpenChange }: MeetingPreparationAssistantProps) {
  const [talkingPoints, setTalkingPoints] = useState<TalkingPoint[]>([])
  const [participantInsights, setParticipantInsights] = useState<ParticipantInsight[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [customNotes, setCustomNotes] = useState("")

  useEffect(() => {
    generatePreparationContent()
  }, [])

  const generatePreparationContent = () => {
    setIsGenerating(true)

    setTimeout(() => {
      const points: TalkingPoint[] = [
        {
          id: "1",
          category: "agenda",
          content: "Review Q4 performance metrics - focus on customer acquisition cost trends",
          priority: "high",
          source: "Previous meeting notes",
          confidence: 92,
        },
        {
          id: "2",
          category: "question",
          content: "What are the main blockers preventing the mobile app release?",
          priority: "high",
          source: "Slack conversations",
          confidence: 88,
        },
        {
          id: "3",
          category: "update",
          content: "Share progress on the new onboarding flow - 23% improvement in completion rate",
          priority: "medium",
          source: "Analytics dashboard",
          confidence: 95,
        },
        {
          id: "4",
          category: "decision",
          content: "Finalize budget allocation for Q1 marketing campaigns",
          priority: "high",
          source: "Email threads",
          confidence: 85,
        },
        {
          id: "5",
          category: "question",
          content: "How can we improve cross-team collaboration based on recent feedback?",
          priority: "medium",
          source: "Survey results",
          confidence: 78,
        },
      ]

      const insights: ParticipantInsight[] = [
        {
          id: "1",
          name: "Sarah Chen",
          avatar: "/professional-woman-diverse.png",
          role: "Product Manager",
          expertise: ["Product Strategy", "User Research", "Analytics"],
          recentActivity: "Published user research findings on mobile app usage",
          suggestedTopics: ["Mobile app roadmap", "User feedback integration"],
          lastInteraction: "2 days ago",
        },
        {
          id: "2",
          name: "Marcus Johnson",
          avatar: "/professional-man.png",
          role: "Engineering Lead",
          expertise: ["Technical Architecture", "Team Management", "DevOps"],
          recentActivity: "Completed infrastructure migration to improve performance",
          suggestedTopics: ["Technical debt priorities", "Development timeline"],
          lastInteraction: "1 day ago",
        },
        {
          id: "3",
          name: "Elena Rodriguez",
          avatar: "/professional-woman-diverse.png",
          role: "Marketing Director",
          expertise: ["Digital Marketing", "Brand Strategy", "Analytics"],
          recentActivity: "Launched new campaign resulting in 34% increase in leads",
          suggestedTopics: ["Campaign performance", "Budget reallocation"],
          lastInteraction: "3 hours ago",
        },
      ]

      setTalkingPoints(points)
      setParticipantInsights(insights)
      setIsGenerating(false)
    }, 2000)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-400"
      case "medium":
        return "text-yellow-400"
      case "low":
        return "text-green-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "agenda":
        return <Target className="h-3 w-3" />
      case "question":
        return <AlertCircle className="h-3 w-3" />
      case "update":
        return <FileText className="h-3 w-3" />
      case "decision":
        return <CheckCircle2 className="h-3 w-3" />
      default:
        return <Lightbulb className="h-3 w-3" />
    }
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const addCustomPoint = () => {
    if (!customNotes.trim()) return

    const newPoint: TalkingPoint = {
      id: Date.now().toString(),
      category: "agenda",
      content: customNotes,
      priority: "medium",
      source: "Manual input",
      confidence: 100,
    }

    setTalkingPoints((prev) => [newPoint, ...prev])
    setCustomNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[98vw] !h-[98vh] !max-w-none !max-h-none overflow-y-auto glass-strong border border-white/20">
        <DialogHeader className="pb-4 border-b border-white/20">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Meeting Preparation Assistant
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          {/* AI-Generated Talking Points */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              AI-Generated Talking Points
            </h4>

            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">
                {talkingPoints.map((point) => (
                  <div key={point.id} className="p-3 border border-border rounded-lg bg-muted/10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(point.category)}
                        <Badge variant="outline" className="text-xs capitalize">
                          {point.category}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(point.priority)}`}>
                          {point.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">{point.confidence}%</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-5 w-5 p-0 bg-transparent"
                          onClick={() => copyToClipboard(point.content)}
                        >
                          <Copy className="h-2 w-2" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{point.content}</p>
                    <p className="text-xs text-muted-foreground">Source: {point.source}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Add Custom Point */}
          <div className="space-y-2">
            <h4 className="font-medium">Add Custom Talking Point</h4>
            <div className="flex gap-2">
              <Textarea
                placeholder="Add your own talking point or agenda item..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                className="flex-1 min-h-[60px]"
              />
              <Button variant="outline" size="sm" className="bg-transparent" onClick={addCustomPoint}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Participant Insights */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Participant Insights
            </h4>

            <div className="space-y-3">
              {participantInsights.map((participant) => (
                <div key={participant.id} className="p-3 border border-border rounded-lg bg-muted/10">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h5 className="font-medium text-sm">{participant.name}</h5>
                        <p className="text-xs text-muted-foreground">{participant.role}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs">
                          <span className="font-medium">Recent:</span> {participant.recentActivity}
                        </p>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-xs font-medium">Expertise:</span>
                          {participant.expertise.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-medium">Suggested topics:</span>
                          <div className="flex flex-wrap gap-1">
                            {participant.suggestedTopics.map((topic, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-primary/10 text-primary">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
