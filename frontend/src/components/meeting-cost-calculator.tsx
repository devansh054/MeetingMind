"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DollarSign,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Calculator,
  Settings,
  AlertTriangle,
  Target,
  BarChart3,
} from "lucide-react"

interface Participant {
  id: string
  name: string
  avatar: string
  role: string
  hourlyRate: number
  attendanceTime: number // in minutes
}

interface CostBreakdown {
  totalCost: number
  costPerMinute: number
  participantCosts: { [key: string]: number }
  efficiency: number
  recommendation: string
}

interface MeetingCostCalculatorProps {
  participants?: { id: string; name: string; avatar?: string; role?: string }[]
  meetingDuration?: number
  onCostUpdate?: (cost: number, efficiency: number) => void
}

export default function MeetingCostCalculator({ 
  participants: externalParticipants = [], 
  meetingDuration: externalDuration,
  onCostUpdate 
}: MeetingCostCalculatorProps) {
  // Initialize participants from props or use defaults
  const [participants, setParticipants] = useState<Participant[]>(() => {
    if (externalParticipants.length > 0) {
      return externalParticipants.map((p, index) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar || `/placeholder-${index % 4 + 1}.png`,
        role: p.role || getRoleByIndex(index),
        hourlyRate: getDefaultRateByRole(p.role || getRoleByIndex(index)),
        attendanceTime: externalDuration || 45
      }))
    }
    return [
      {
        id: "1",
        name: "Sarah Chen",
        avatar: "/professional-woman-diverse.png",
        role: "Product Manager",
        hourlyRate: 85,
        attendanceTime: 45,
      },
      {
        id: "2",
        name: "Marcus Johnson",
        avatar: "/professional-man.png",
        role: "Engineering Lead",
        hourlyRate: 95,
        attendanceTime: 45,
      },
      {
        id: "3",
        name: "Elena Rodriguez",
        avatar: "/professional-woman-diverse.png",
        role: "Marketing Director",
        hourlyRate: 75,
        attendanceTime: 30,
      },
      {
        id: "4",
        name: "David Kim",
        avatar: "/professional-man.png",
        role: "Designer",
        hourlyRate: 65,
        attendanceTime: 45,
      },
    ]
  })

  const [meetingDuration, setMeetingDuration] = useState([externalDuration || 45])
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Helper functions for role assignment
  const getRoleByIndex = (index: number): string => {
    const roles = ['Product Manager', 'Engineering Lead', 'Marketing Director', 'Designer', 'Analyst', 'Consultant']
    return roles[index % roles.length]
  }

  const getDefaultRateByRole = (role: string): number => {
    const roleRates: { [key: string]: number } = {
      'Product Manager': 85,
      'Engineering Lead': 95,
      'Marketing Director': 75,
      'Designer': 65,
      'Analyst': 70,
      'Consultant': 80,
    }
    return roleRates[role] || 75
  }

  useEffect(() => {
    calculateCosts()
  }, [participants, meetingDuration])

  // Update external duration when prop changes
  useEffect(() => {
    if (externalDuration && externalDuration !== meetingDuration[0]) {
      setMeetingDuration([externalDuration])
      // Update all participants' attendance time
      setParticipants(prev => prev.map(p => ({ ...p, attendanceTime: externalDuration })))
    }
  }, [externalDuration])

  // Update participants when external participants change
  useEffect(() => {
    if (externalParticipants.length > 0) {
      setParticipants(externalParticipants.map((p, index) => {
        // Try to preserve existing data if participant already exists
        const existing = participants.find(existing => existing.id === p.id)
        return {
          id: p.id,
          name: p.name,
          avatar: p.avatar || existing?.avatar || `/placeholder-${index % 4 + 1}.png`,
          role: p.role || existing?.role || getRoleByIndex(index),
          hourlyRate: existing?.hourlyRate || getDefaultRateByRole(p.role || getRoleByIndex(index)),
          attendanceTime: existing?.attendanceTime || externalDuration || 45
        }
      }))
    }
  }, [externalParticipants])

  const calculateCosts = () => {
    const duration = meetingDuration[0]
    let totalCost = 0
    const participantCosts: { [key: string]: number } = {}

    participants.forEach((participant) => {
      const attendanceHours = Math.min(participant.attendanceTime, duration) / 60
      const cost = participant.hourlyRate * attendanceHours
      participantCosts[participant.id] = cost
      totalCost += cost
    })

    const costPerMinute = totalCost / duration
    const efficiency = calculateEfficiency(totalCost, duration, participants.length)
    const recommendation = getRecommendation(efficiency, totalCost, duration)

    const breakdown = {
      totalCost,
      costPerMinute,
      participantCosts,
      efficiency,
      recommendation,
    }
    
    setCostBreakdown(breakdown)
    
    // Notify parent component of cost updates
    onCostUpdate?.(totalCost, efficiency)
  }

  const calculateEfficiency = (cost: number, duration: number, participantCount: number): number => {
    // Simple efficiency calculation based on cost per participant per minute
    const costPerParticipantPerMinute = cost / (participantCount * duration)

    // Efficiency score (0-100) - lower cost per participant per minute = higher efficiency
    if (costPerParticipantPerMinute < 1) return 95
    if (costPerParticipantPerMinute < 2) return 85
    if (costPerParticipantPerMinute < 3) return 70
    if (costPerParticipantPerMinute < 4) return 55
    return 40
  }

  const getRecommendation = (efficiency: number, cost: number, duration: number): string => {
    if (efficiency >= 85) {
      return "Excellent cost efficiency. Meeting is well-structured for the value delivered."
    }
    if (efficiency >= 70) {
      return "Good efficiency. Consider reducing duration by 10-15 minutes for optimal value."
    }
    if (efficiency >= 55) {
      return "Moderate efficiency. Review if all participants need to attend the full duration."
    }
    return "Low efficiency. Consider breaking into smaller groups or async communication."
  }

  const updateParticipantRate = (participantId: string, newRate: number) => {
    setParticipants((prev) => prev.map((p) => (p.id === participantId ? { ...p, hourlyRate: newRate } : p)))
  }

  const updateAttendanceTime = (participantId: string, newTime: number) => {
    setParticipants((prev) => prev.map((p) => (p.id === participantId ? { ...p, attendanceTime: newTime } : p)))
  }

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 85) return "text-green-400"
    if (efficiency >= 70) return "text-blue-400"
    if (efficiency >= 55) return "text-yellow-400"
    return "text-red-400"
  }

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 70) return <TrendingUp className="h-4 w-4 text-green-400" />
    if (efficiency >= 55) return <BarChart3 className="h-4 w-4 text-yellow-400" />
    return <TrendingDown className="h-4 w-4 text-red-400" />
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            Meeting Cost Calculator
          </CardTitle>
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="bg-transparent">
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong max-w-2xl">
              <DialogHeader>
                <DialogTitle>Cost Calculator Settings</DialogTitle>
                <DialogDescription>Configure participant rates and attendance</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {participant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h5 className="font-medium text-sm">{participant.name}</h5>
                        <p className="text-xs text-muted-foreground">{participant.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Hourly Rate ($)</Label>
                        <Input
                          type="number"
                          value={participant.hourlyRate}
                          onChange={(e) => updateParticipantRate(participant.id, Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Attendance (minutes)</Label>
                        <Input
                          type="number"
                          value={participant.attendanceTime}
                          onChange={(e) => updateAttendanceTime(participant.id, Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="w-full" onClick={() => setShowSettings(false)}>
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Meeting Duration Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Meeting Duration</Label>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{meetingDuration[0]} minutes</span>
            </div>
          </div>
          <Slider
            value={meetingDuration}
            onValueChange={setMeetingDuration}
            max={180}
            min={15}
            step={15}
            className="w-full"
          />
        </div>

        {/* Cost Overview */}
        {costBreakdown && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">${costBreakdown.totalCost.toFixed(0)}</div>
              <div className="text-xs text-muted-foreground">Total Cost</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <Calculator className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">${costBreakdown.costPerMinute.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">Per Minute</div>
            </div>
          </div>
        )}

        {/* Efficiency Score */}
        {costBreakdown && (
          <div className="p-4 bg-muted/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Efficiency Score
              </h4>
              <div className="flex items-center gap-2">
                {getEfficiencyIcon(costBreakdown.efficiency)}
                <span className={`font-bold ${getEfficiencyColor(costBreakdown.efficiency)}`}>
                  {costBreakdown.efficiency}%
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{costBreakdown.recommendation}</p>
          </div>
        )}

        {/* Participant Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Participant Costs
          </h4>
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-2 bg-muted/10 rounded">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {participant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm font-medium">{participant.name}</span>
                    <div className="text-xs text-muted-foreground">
                      ${participant.hourlyRate}/hr • {participant.attendanceTime}min
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    ${costBreakdown?.participantCosts[participant.id]?.toFixed(0) || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(
                      ((costBreakdown?.participantCosts[participant.id] || 0) / (costBreakdown?.totalCost || 1)) *
                      100
                    ).toFixed(0)}
                    %
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Optimization Tips */}
        <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="h-3 w-3 text-primary" />
            Cost Optimization Tips
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Consider async updates for status meetings</li>
            <li>• Use breakout rooms for role-specific discussions</li>
            <li>• Set clear agendas to reduce meeting duration</li>
            <li>• Optional attendance for non-essential participants</li>
            <li>• Record sessions for absent team members</li>
            <li>• Use AI insights to identify discussion patterns</li>
          </ul>
        </div>

        {/* Real-time Cost Insights */}
        {costBreakdown && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Cost Insights
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-sm font-medium">
                  ${(costBreakdown.totalCost * 0.88).toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">Projected Savings</div>
                <Badge variant="outline" className="text-xs mt-1 bg-green-500/20 text-green-400">
                  -12% with async
                </Badge>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <div className="text-sm font-medium">
                  ${(costBreakdown.costPerMinute * (meetingDuration[0] - 15)).toFixed(0)}
                </div>
                <div className="text-xs text-muted-foreground">15min Shorter</div>
                <Badge variant="outline" className="text-xs mt-1 bg-blue-500/20 text-blue-400">
                  ${(costBreakdown.costPerMinute * 15).toFixed(0)} saved
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
