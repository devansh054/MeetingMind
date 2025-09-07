"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Clock, Users, Target, Lightbulb } from "lucide-react"

interface PredictiveInsight {
  type: "success" | "warning" | "info" | "suggestion"
  title: string
  description: string
  confidence: number
  impact: "high" | "medium" | "low"
  actionable: boolean
}

interface MeetingPrediction {
  outcomeScore: number
  engagementForecast: number
  timeOverrunRisk: number
  participationBalance: number
  insights: PredictiveInsight[]
}

export default function PredictiveInsights() {
  const [prediction, setPrediction] = useState<MeetingPrediction | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    const generatePrediction = () => {
      const insights: PredictiveInsight[] = [
        {
          type: "warning",
          title: "Time Overrun Risk",
          description: "Current agenda has 73% chance of running over by 15+ minutes",
          confidence: 87,
          impact: "high",
          actionable: true,
        },
        {
          type: "suggestion",
          title: "Engagement Optimization",
          description: "Adding a 5-minute break at 30min mark could improve focus by 34%",
          confidence: 92,
          impact: "medium",
          actionable: true,
        },
        {
          type: "success",
          title: "Strong Participation Expected",
          description: "All key stakeholders likely to contribute based on historical patterns",
          confidence: 89,
          impact: "high",
          actionable: false,
        },
        {
          type: "info",
          title: "Decision Readiness",
          description: "68% probability of reaching consensus on main agenda items",
          confidence: 76,
          impact: "medium",
          actionable: false,
        },
      ]

      setPrediction({
        outcomeScore: 78,
        engagementForecast: 85,
        timeOverrunRisk: 73,
        participationBalance: 82,
        insights,
      })
    }

    generatePrediction()
  }, [])

  const analyzeAgenda = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      // Refresh predictions
    }, 2000)
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "info":
        return <Brain className="h-4 w-4 text-blue-400" />
      case "suggestion":
        return <Lightbulb className="h-4 w-4 text-purple-400" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-400/30 bg-green-400/10"
      case "warning":
        return "border-yellow-400/30 bg-yellow-400/10"
      case "info":
        return "border-blue-400/30 bg-blue-400/10"
      case "suggestion":
        return "border-purple-400/30 bg-purple-400/10"
      default:
        return "border-border bg-muted/20"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400"
    if (score >= 60) return "text-yellow-400"
    return "text-red-400"
  }

  if (!prediction) return null

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Predictive Meeting Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">AI-powered predictions based on historical meeting data</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prediction Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Target className="h-3 w-3" />
                Outcome Score
              </span>
              <span className={getScoreColor(prediction.outcomeScore)}>{prediction.outcomeScore}%</span>
            </div>
            <Progress value={prediction.outcomeScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3" />
                Engagement
              </span>
              <span className={getScoreColor(prediction.engagementForecast)}>{prediction.engagementForecast}%</span>
            </div>
            <Progress value={prediction.engagementForecast} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                Time Risk
              </span>
              <span className={getScoreColor(100 - prediction.timeOverrunRisk)}>{prediction.timeOverrunRisk}%</span>
            </div>
            <Progress value={prediction.timeOverrunRisk} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                Participation
              </span>
              <span className={getScoreColor(prediction.participationBalance)}>{prediction.participationBalance}%</span>
            </div>
            <Progress value={prediction.participationBalance} className="h-2" />
          </div>
        </div>

        {/* Insights */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">AI Predictions</h4>
          {prediction.insights.map((insight, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}>
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium">{insight.title}</h5>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-muted/30">
                        {insight.confidence}% confident
                      </Badge>
                      <Badge
                        variant={insight.impact === "high" ? "default" : "secondary"}
                        className={`text-xs ${
                          insight.impact === "high"
                            ? "bg-red-600 text-white"
                            : insight.impact === "medium"
                              ? "bg-yellow-600 text-white"
                              : "bg-slate-600 text-white"
                        }`}
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                  {insight.actionable && (
                    <Button variant="outline" size="sm" className="mt-2 h-6 text-xs bg-transparent">
                      Apply Suggestion
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <Button onClick={analyzeAgenda} disabled={isAnalyzing} className="w-full" size="sm">
          <Brain className="h-4 w-4 mr-2" />
          {isAnalyzing ? "Re-analyzing..." : "Refresh Predictions"}
        </Button>
      </CardContent>
    </Card>
  )
}
