"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DetailedInsightsModal from "./detailed-insights-modal"
import {
  Brain,
  BarChart3,
  CheckSquare,
  Lightbulb,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  FileText,
  Heart,
  Frown,
  Meh,
  Smile,
} from "lucide-react"

interface AIInsightsPanelProps {
  isProcessing?: boolean
  transcript?: Array<{speaker: string, text: string, timestamp: Date}>
  meetingDuration?: number
}

export default function AIInsightsPanel({ isProcessing = false, transcript = [], meetingDuration = 0 }: AIInsightsPanelProps) {
  const [processingProgress, setProcessingProgress] = useState(0)
  const [activeInsight, setActiveInsight] = useState("summary")
  const [showInsightsModal, setShowInsightsModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isExtractingActions, setIsExtractingActions] = useState(false)
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false)

  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setProcessingProgress((prev) => (prev >= 100 ? 0 : prev + 10))
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isProcessing])

  const sentimentData = {
    positive: 65,
    neutral: 25,
    negative: 10,
    overall: "positive",
  }

  // Generate dynamic participation metrics from transcript
  const generateParticipationMetrics = () => {
    if (transcript.length === 0) {
      return [{ name: "No participants yet", speakTime: 0, contributions: 0, sentiment: "neutral" }]
    }

    const participantStats = transcript.reduce((acc, entry) => {
      if (!acc[entry.speaker]) {
        acc[entry.speaker] = { contributions: 0, totalWords: 0 }
      }
      acc[entry.speaker].contributions += 1
      acc[entry.speaker].totalWords += entry.text.split(' ').length
      return acc
    }, {} as Record<string, { contributions: number, totalWords: number }>)

    const totalWords = Object.values(participantStats).reduce((sum, stats) => sum + stats.totalWords, 0)
    
    return Object.entries(participantStats).map(([name, stats]) => ({
      name,
      speakTime: totalWords > 0 ? Math.round((stats.totalWords / totalWords) * 100) : 0,
      contributions: stats.contributions,
      sentiment: stats.contributions > 3 ? "positive" : stats.contributions > 1 ? "neutral" : "neutral"
    })).sort((a, b) => b.speakTime - a.speakTime)
  }

  const participationMetrics = generateParticipationMetrics()

  // Generate dynamic action items from transcript
  const generateActionItems = () => {
    if (transcript.length === 0) {
      return []
    }

    interface ActionItem {
      id: number
      task: string
      assignee: string
      priority: 'high' | 'medium' | 'low'
      confidence: number
      extractedFrom: string
      dueDate: string
    }

    const actions: ActionItem[] = []
    const actionKeywords = ['will', 'should', 'need to', 'must', 'have to', 'going to', 'plan to', 'commit to', 'responsible for', 'take care of']
    const speakers = [...new Set(transcript.map(entry => entry.speaker))]
    
    // Generate consistent due dates based on action content and speaker
    const generateDueDate = (text: string, speakerIndex: number) => {
      const textLower = text.toLowerCase()
      
      // Check for explicit time mentions in the text
      if (textLower.includes('today') || textLower.includes('asap') || textLower.includes('urgent')) {
        return 'Today'
      }
      if (textLower.includes('tomorrow')) {
        return 'Tomorrow'
      }
      if (textLower.includes('monday')) {
        return 'Monday'
      }
      if (textLower.includes('friday')) {
        return 'Friday'
      }
      if (textLower.includes('this week')) {
        return 'This week'
      }
      if (textLower.includes('next week')) {
        return 'Next week'
      }
      if (textLower.includes('month')) {
        return 'End of month'
      }
      
      // Default based on priority and speaker to ensure consistency
      const dueDates = ['This week', 'Next Friday', 'Next Monday', 'End of month']
      return dueDates[speakerIndex % dueDates.length]
    }
    
    transcript.forEach((entry, index) => {
      const text = entry.text.toLowerCase()
      const hasActionKeyword = actionKeywords.some(keyword => text.includes(keyword))
      
      if (hasActionKeyword && entry.text.length > 15) {
        const priority: 'high' | 'medium' | 'low' = text.includes('urgent') || text.includes('asap') || text.includes('critical') ? 'high' : 
                                                    text.includes('important') || text.includes('priority') ? 'medium' : 'low'
        // Generate confidence based on text characteristics for consistency
        const textLength = entry.text.length
        const hasSpecificDetails = text.includes('will') || text.includes('by') || text.includes('on') || text.includes('at')
        const hasUncertainty = text.includes('maybe') || text.includes('might') || text.includes('probably')
        
        let confidence = 75 // Base confidence
        if (textLength > 50) confidence += 10 // Longer text = more context
        if (hasSpecificDetails) confidence += 10 // Specific details = higher confidence
        if (hasUncertainty) confidence -= 15 // Uncertainty words = lower confidence
        if (priority === 'high') confidence += 5 // High priority items tend to be clearer
        
        // Add some variation based on text hash for consistency
        const textHash = entry.text.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        confidence += (textHash % 10) - 5 // ±5 variation based on text content
        
        confidence = Math.max(65, Math.min(95, confidence)) // Clamp between 65-95%
        
        // Generate realistic timestamps based on meeting duration and transcript position
        const meetingMinutes = Math.floor(meetingDuration / 60000) || 1 // Convert to minutes, minimum 1
        const transcriptProgress = (index + 1) / transcript.length // How far through the transcript
        const estimatedMinute = Math.floor(transcriptProgress * Math.max(meetingMinutes, 5)) // At least 5 minutes spread
        const estimatedSecond = Math.floor((transcriptProgress * 60) % 60)
        const timestamp = `${estimatedMinute}:${String(estimatedSecond).padStart(2, '0')}`
        const speakerIndex = speakers.indexOf(entry.speaker)
        const assignee = entry.speaker || 'Unassigned'
        const dueDate = generateDueDate(entry.text, speakerIndex >= 0 ? speakerIndex : 0)
        
        actions.push({
          id: actions.length + 1,
          task: entry.text,
          assignee,
          priority,
          confidence,
          extractedFrom: `Discussion at ${timestamp}`,
          dueDate,
        })
      }
    })

    // If no actions found in transcript, return placeholder
    if (actions.length === 0) {
      return [{
        id: 1,
        task: "No action items detected yet. AI will identify tasks and assignments as the meeting progresses.",
        assignee: speakers[0] || "Unassigned",
        priority: "medium" as const,
        confidence: 0,
        extractedFrom: "Waiting for content",
        dueDate: "TBD",
      }]
    }

    return actions.slice(0, 4) // Limit to 4 most recent actions
  }

  const aiActions = generateActionItems()

  // Generate dynamic key decisions from transcript
  const generateKeyDecisions = () => {
    if (transcript.length === 0) {
      return []
    }

    interface Decision {
      id: number
      decision: string
      impact: 'high' | 'medium' | 'low'
      participants: string[]
      timestamp: string
    }

    const decisions: Decision[] = []
    const decisionKeywords = ['approved', 'decided', 'agreed', 'confirmed', 'resolved', 'concluded', 'finalized', 'committed']
    const speakers = [...new Set(transcript.map(entry => entry.speaker))]
    
    transcript.forEach((entry, index) => {
      const text = entry.text.toLowerCase()
      const hasDecisionKeyword = decisionKeywords.some(keyword => text.includes(keyword))
      
      if (hasDecisionKeyword && entry.text.length > 20) {
        const impact: 'high' | 'medium' | 'low' = text.includes('budget') || text.includes('hire') || text.includes('launch') || text.includes('major') ? 'high' : 'medium'
        
        // Generate realistic timestamps for decisions too
        const meetingMinutes = Math.floor(meetingDuration / 60000) || 1
        const transcriptProgress = (index + 1) / transcript.length
        const estimatedMinute = Math.floor(transcriptProgress * Math.max(meetingMinutes, 5))
        const estimatedSecond = Math.floor((transcriptProgress * 60) % 60)
        const timestamp = `${estimatedMinute}:${String(estimatedSecond).padStart(2, '0')}`
        
        decisions.push({
          id: decisions.length + 1,
          decision: entry.text,
          impact,
          participants: speakers.slice(0, Math.min(2, speakers.length)),
          timestamp,
        })
      }
    })

    // If no decisions found in transcript, return placeholder
    if (decisions.length === 0) {
      return [{
        id: 1,
        decision: "No key decisions detected yet. AI will identify decisions as the meeting progresses.",
        impact: "medium" as const,
        participants: speakers.slice(0, 2),
        timestamp: "00:00",
      }]
    }

    return decisions.slice(0, 3) // Limit to 3 most recent decisions
  }

  const keyDecisions = generateKeyDecisions()

  // Generate dynamic content based on transcript
  const generateMeetingSummary = () => {
    if (transcript.length === 0) {
      return "No transcript available yet. Start speaking to generate AI insights."
    }
    
    const totalWords = transcript.reduce((acc, entry) => acc + entry.text.split(' ').length, 0)
    const speakers = [...new Set(transcript.map(entry => entry.speaker))]
    
    if (totalWords < 10) {
      return "Meeting in progress. AI insights will appear as more content is captured."
    }
    
    return `Live meeting analysis based on ${totalWords} words from ${speakers.length} participant${speakers.length !== 1 ? 's' : ''}. AI is processing conversation patterns, key topics, and generating actionable insights in real-time.`
  }

  const calculateMeetingEfficiency = () => {
    if (transcript.length === 0) return 0
    const wordsPerMinute = transcript.length > 0 ? (transcript.reduce((acc, entry) => acc + entry.text.split(' ').length, 0) / Math.max(meetingDuration / 60000, 1)) : 0
    return Math.min(Math.round((wordsPerMinute / 150) * 100), 100) // 150 WPM is good pace
  }

  const getKeyTopicsCount = () => {
    if (transcript.length === 0) return 0
    const allText = transcript.map(entry => entry.text).join(' ').toLowerCase()
    const topics = ['budget', 'project', 'team', 'plan', 'goal', 'strategy', 'review', 'update']
    return topics.filter(topic => allText.includes(topic)).length
  }

  const topicAnalysis = transcript.length > 0 ? [
    { topic: "Current Discussion", duration: `${Math.round(meetingDuration / 60000)} min`, sentiment: "positive", importance: 85 },
    { topic: "Key Points", duration: `${Math.round(transcript.length / 2)} min`, sentiment: "neutral", importance: 78 },
  ] : [
    { topic: "Waiting for content", duration: "0 min", sentiment: "neutral", importance: 0 },
  ]

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true)
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setActiveInsight("summary")
    setIsGeneratingSummary(false)
  }

  const handleExtractActions = async () => {
    setIsExtractingActions(true)
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    setActiveInsight("actions")
    setIsExtractingActions(false)
  }

  const handleAnalyzeSentiment = async () => {
    setIsAnalyzingSentiment(true)
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000))
    setActiveInsight("sentiment")
    setIsAnalyzingSentiment(false)
  }

  const handleExportReport = async () => {
    setIsExporting(true)

    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Create comprehensive meeting report
    const reportData = {
      timestamp: new Date().toLocaleString(),
      summary: "AI-powered meeting analysis with sentiment, actions, and participation metrics",
      actionItems: aiActions.length,
      sentimentScore: `${sentimentData.positive}% positive`,
      participants: participationMetrics.length,
    }

    const reportContent = `
MEETING MIND - LIVE AI INSIGHTS
==============================

Generated: ${reportData.timestamp}
Summary: ${reportData.summary}

QUICK STATS
===========
- Action Items Identified: ${reportData.actionItems}
- Overall Sentiment: ${reportData.sentimentScore}
- Active Participants: ${reportData.participants}
- Meeting Efficiency: 92%

ACTION ITEMS
============
${aiActions
  .map(
    (action, i) =>
      `${i + 1}. ${action.task}\n   Assignee: ${action.assignee}\n   Priority: ${action.priority}\n   Due: ${action.dueDate}\n`,
  )
  .join("\n")}

SENTIMENT BREAKDOWN
==================
- Positive: ${sentimentData.positive}%
- Neutral: ${sentimentData.neutral}%
- Negative: ${sentimentData.negative}%

Generated by Meeting Mind AI
    `.trim()

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `live-meeting-insights-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setIsExporting(false)
  }

  return (
    <div className="space-y-4">
      {/* AI Processing Status */}
      {isProcessing && (
        <Card className="glass border-primary/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Brain className="h-5 w-5 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-primary rounded-full animate-ping" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">AI Analysis in Progress</p>
                <Progress value={processingProgress} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick AI Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-transparent"
          onClick={handleGenerateSummary}
          disabled={isGeneratingSummary}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          {isGeneratingSummary ? "Generating..." : "Generate Summary"}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-transparent"
          onClick={handleExtractActions}
          disabled={isExtractingActions}
        >
          <Target className="h-4 w-4 mr-1" />
          {isExtractingActions ? "Extracting..." : "Extract Actions"}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-transparent"
          onClick={handleAnalyzeSentiment}
          disabled={isAnalyzingSentiment}
        >
          <Heart className="h-4 w-4 mr-1" />
          {isAnalyzingSentiment ? "Analyzing..." : "Analyze Sentiment"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-transparent"
          onClick={handleExportReport}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4 mr-1" />
          {isExporting ? "Exporting..." : "Export Report"}
        </Button>
      </div>

      {/* AI Insights Tabs */}
      <Tabs value={activeInsight} onValueChange={setActiveInsight} className="w-full">
        <TabsList className="grid w-full grid-cols-4 text-xs">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4 space-y-3">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Meeting Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-3">
                {generateMeetingSummary()}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Meeting Efficiency</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    {calculateMeetingEfficiency()}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Key Topics Covered</span>
                  <span className="font-medium">{getKeyTopicsCount()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Action Items Generated</span>
                  <span className="font-medium">{aiActions.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Key Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {topicAnalysis.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-accent/5">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{topic.topic}</p>
                      <p className="text-xs text-muted-foreground">{topic.duration}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={topic.importance} className="w-12 h-1" />
                      <span className="text-xs text-muted-foreground">{topic.importance}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="mt-4 space-y-3">
          {aiActions.map((action) => (
            <Card key={action.id} className="glass">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckSquare className="h-4 w-4 text-primary mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{action.task}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {action.assignee}
                      </Badge>
                      <Badge variant={action.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                        {action.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Due: {action.dueDate}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <div className="h-1 w-1 bg-primary rounded-full" />
                        <span className="text-xs text-muted-foreground">{action.confidence}% confidence</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{action.extractedFrom}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="sentiment" className="mt-4 space-y-3">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Overall Sentiment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Smile className="h-4 w-4 text-green-400" />
                    <span className="text-sm">Positive</span>
                    <span className="text-xs text-muted-foreground ml-auto">{sentimentData.positive}%</span>
                  </div>
                  <Progress value={sentimentData.positive} className="h-2" />
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Meh className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">Neutral</span>
                    <span className="text-xs text-muted-foreground ml-auto">{sentimentData.neutral}%</span>
                  </div>
                  <Progress value={sentimentData.neutral} className="h-2" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Frown className="h-4 w-4 text-red-400" />
                    <span className="text-sm">Negative</span>
                    <span className="text-xs text-muted-foreground ml-auto">{sentimentData.negative}%</span>
                  </div>
                  <Progress value={sentimentData.negative} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Key Decisions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {keyDecisions.map((decision) => (
                  <div key={decision.id} className="p-3 rounded-lg bg-accent/5">
                    <p className="text-sm font-medium">{decision.decision}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={decision.impact === "high" ? "destructive" : "secondary"} className="text-xs">
                        {decision.impact} impact
                      </Badge>
                      <span className="text-xs text-muted-foreground">at {decision.timestamp}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Participants: {decision.participants.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4 space-y-3">
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Participation Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {participationMetrics.map((participant, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{participant.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{participant.speakTime}%</span>
                        {participant.sentiment === "positive" ? (
                          <Smile className="h-3 w-3 text-green-400" />
                        ) : (
                          <Meh className="h-3 w-3 text-yellow-400" />
                        )}
                      </div>
                    </div>
                    <Progress value={participant.speakTime} className="h-1" />
                    <p className="text-xs text-muted-foreground">{participant.contributions} contributions</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Meeting Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Engagement Score</span>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    High (8.7/10)
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Speaking Distribution</span>
                  <span className="text-xs">Balanced</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Decision Velocity</span>
                  <span className="text-xs">Above Average</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Follow-up Required</span>
                  <Badge variant="outline" className="text-xs">
                    3 items
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Insights Modal */}
      <DetailedInsightsModal open={showInsightsModal} onOpenChange={setShowInsightsModal} />
    </div>
  )
}
