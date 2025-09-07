import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Calculator, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Download
} from "lucide-react";

interface MeetingCostTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MeetingCostTrackerModal: React.FC<MeetingCostTrackerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [participants, setParticipants] = useState(8);
  const [duration, setDuration] = useState(60);
  const [avgHourlyRate, setAvgHourlyRate] = useState(75);
  const [meetingCost, setMeetingCost] = useState(0);
  const [roi, setRoi] = useState(0);

  useEffect(() => {
    const cost = (participants * avgHourlyRate * duration) / 60;
    setMeetingCost(cost);
    
    // Calculate ROI based on meeting effectiveness (mock calculation)
    const baseROI = 150; // Base ROI percentage
    const efficiencyFactor = Math.max(0.5, Math.min(2, 60 / duration)); // Shorter meetings are more efficient
    const participantFactor = Math.max(0.7, Math.min(1.3, 8 / participants)); // Optimal around 8 people
    setRoi(Math.round(baseROI * efficiencyFactor * participantFactor));
  }, [participants, duration, avgHourlyRate]);

  const weeklyStats = {
    totalMeetings: 12,
    totalCost: 4800,
    totalHours: 18,
    avgCostPerMeeting: 400,
    efficiency: 78
  };

  const monthlyTrend = [
    { month: 'Jan', cost: 18500, roi: 145 },
    { month: 'Feb', cost: 16200, roi: 162 },
    { month: 'Mar', cost: 19800, roi: 138 },
    { month: 'Apr', cost: 15600, roi: 175 }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[98vw] !h-[98vh] !max-w-none !max-h-none overflow-y-auto glass-strong border border-white/20">
        <DialogHeader className="pb-4 border-b border-white/20">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Meeting Cost Tracker & ROI Calculator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Cost Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass border border-white/20">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Meeting Cost Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Number of Participants</label>
                  <Input
                    type="number"
                    value={participants}
                    onChange={(e) => setParticipants(Number(e.target.value))}
                    className="bg-white/10 border-white/20 text-white"
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="bg-white/10 border-white/20 text-white"
                    min="15"
                    max="480"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Average Hourly Rate ($)</label>
                  <Input
                    type="number"
                    value={avgHourlyRate}
                    onChange={(e) => setAvgHourlyRate(Number(e.target.value))}
                    className="bg-white/10 border-white/20 text-white"
                    min="25"
                    max="500"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-white/20">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-3xl font-bold text-white mb-2">
                    ${meetingCost.toFixed(0)}
                  </div>
                  <div className="text-sm text-white/60">Total Meeting Cost</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-xl font-semibold text-white">{roi}%</div>
                    <div className="text-xs text-white/60">Estimated ROI</div>
                  </div>
                  <div className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-xl font-semibold text-white">${(meetingCost / participants).toFixed(0)}</div>
                    <div className="text-xs text-white/60">Cost per Person</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Hourly Rate:</span>
                    <span className="text-white">${avgHourlyRate}/hr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Duration:</span>
                    <span className="text-white">{duration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Participants:</span>
                    <span className="text-white">{participants} people</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Overview */}
          <Card className="glass border border-white/20">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                This Week's Meeting Costs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-lg font-semibold text-white">{weeklyStats.totalMeetings}</div>
                  <div className="text-xs text-white/60">Total Meetings</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-lg font-semibold text-white">${weeklyStats.totalCost.toLocaleString()}</div>
                  <div className="text-xs text-white/60">Total Cost</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="text-lg font-semibold text-white">{weeklyStats.totalHours}h</div>
                  <div className="text-xs text-white/60">Total Hours</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <Calculator className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-lg font-semibold text-white">${weeklyStats.avgCostPerMeeting}</div>
                  <div className="text-xs text-white/60">Avg per Meeting</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-lg font-semibold text-white">{weeklyStats.efficiency}%</div>
                  <div className="text-xs text-white/60">Efficiency</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="glass border border-white/20">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                Monthly Cost & ROI Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {monthlyTrend.map((month, index) => (
                  <div key={month.month} className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-center">
                      <div className="text-sm text-white/60 mb-2">{month.month} 2024</div>
                      <div className="text-lg font-semibold text-white mb-1">
                        ${month.cost.toLocaleString()}
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        {month.roi > 150 ? (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        <span className={`text-xs ${month.roi > 150 ? 'text-green-400' : 'text-red-400'}`}>
                          {month.roi}% ROI
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="glass border border-white/20">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Cost Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">High Impact</span>
                </div>
                <p className="text-sm text-white">Reduce meeting duration by 15 minutes to save $150 per meeting on average.</p>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Medium Impact</span>
                </div>
                <p className="text-sm text-white">Limit meetings to essential participants only. Current average of 8 people could be reduced to 5-6.</p>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-400">Best Practice</span>
                </div>
                <p className="text-sm text-white">Schedule meetings for 25 or 50 minutes instead of 30 or 60 to improve focus and efficiency.</p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Save Analysis
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MeetingCostTrackerModal;
