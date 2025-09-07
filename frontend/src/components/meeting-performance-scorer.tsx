"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Users, Clock, Target, Award, AlertCircle, CheckCircle2 } from "lucide-react"

interface PerformanceMetrics {
  overallScore: number
  participationScore: number
  agendaAdherence: number
  outcomeClarity: number
  timeEfficiency: number
  engagementLevel: number
}

interface PerformanceScorerProps {
  meetingId?: string
  isLive?: boolean
}

export default function MeetingPerformanceScorer({ meetingId, isLive = false }: PerformanceScorerProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    overallScore: 0,
    participationScore: 0,
    agendaAdherence: 0,
    outcomeClarity: 0,
    timeEfficiency: 0,
    engagementLevel: 0,
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        setMetrics((prev) => ({
          overallScore: Math.min(100, prev.overallScore + Math.random() * 2),
          participationScore: Math.min(100, prev.participationScore + Math.random() * 3),
          agendaAdherence: Math.min(100, prev.agendaAdherence + Math.random() * 1.5),
          outcomeClarity: Math.min(100, prev.outcomeClarity + Math.random() * 2.5),
          timeEfficiency: Math.min(100, prev.timeEfficiency + Math.random() * 1.8),
          engagementLevel: Math.min(100, prev.engagementLevel + Math.random() * 2.2),
        }))
      }, 3000)

      return () => clearInterval(interval)
    } else {
      // Static metrics for completed meetings
      setMetrics({
        overallScore: 87,
        participationScore: 92,
        agendaAdherence: 78,
        outcomeClarity: 85,
        timeEfficiency: 91,
        engagementLevel: 89,
      })
    }
  }, [isLive])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", variant: "default" as const, className: "bg-green-600 text-white" }
    if (score >= 80) return { label: "Good", variant: "secondary" as const, className: "bg-blue-600 text-white" }
    if (score >= 60) return { label: "Fair", variant: "secondary" as const, className: "bg-yellow-600 text-white" }
    return { label: "Needs Improvement", variant: "destructive" as const, className: "bg-red-600 text-white" }
  }

  const analyzePerformance = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      // Trigger detailed analysis
    }, 2000)
  }

  const overallBadge = getScoreBadge(metrics.overallScore)

  return (
    <Card className="glass">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Meeting Performance Score
          </CardTitle>
          <Badge className={overallBadge.className}>{overallBadge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center space-y-2">
          <div className={`text-3xl font-bold ${getScoreColor(metrics.overallScore)}`}>
            {Math.round(metrics.overallScore)}%
          </div>
          <p className="text-sm text-muted-foreground">Overall Meeting Score</p>
        </div>

        {/* Individual Metrics */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                Participation
              </span>
              <span className={getScoreColor(metrics.participationScore)}>
                {Math.round(metrics.participationScore)}%
              </span>
            </div>
            <Progress value={metrics.participationScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Target className="h-3 w-3" />
                Agenda Adherence
              </span>
              <span className={getScoreColor(metrics.agendaAdherence)}>{Math.round(metrics.agendaAdherence)}%</span>
            </div>
            <Progress value={metrics.agendaAdherence} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" />
                Outcome Clarity
              </span>
              <span className={getScoreColor(metrics.outcomeClarity)}>{Math.round(metrics.outcomeClarity)}%</span>
            </div>
            <Progress value={metrics.outcomeClarity} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Time Efficiency
              </span>
              <span className={getScoreColor(metrics.timeEfficiency)}>{Math.round(metrics.timeEfficiency)}%</span>
            </div>
            <Progress value={metrics.timeEfficiency} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Engagement Level
              </span>
              <span className={getScoreColor(metrics.engagementLevel)}>{Math.round(metrics.engagementLevel)}%</span>
            </div>
            <Progress value={metrics.engagementLevel} className="h-2" />
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="h-3 w-3 text-primary" />
            AI Recommendations
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Encourage more participation from quiet members</li>
            <li>• Consider shorter agenda items for better focus</li>
            <li>• Schedule follow-up for unresolved topics</li>
          </ul>
        </div>

        {!isLive && (
          <Button onClick={analyzePerformance} disabled={isAnalyzing} className="w-full" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            {isAnalyzing ? "Analyzing..." : "Generate Detailed Analysis"}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
