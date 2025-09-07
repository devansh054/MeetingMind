"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { BarChart3, TrendingUp, Users, Clock, DollarSign, Target, Download, Award } from "lucide-react"

interface AnalyticsData {
  productivity: Array<{ month: string; score: number; meetings: number }>
  costs: Array<{ department: string; cost: number; meetings: number }>
  engagement: Array<{ name: string; value: number }>
  trends: Array<{ week: string; efficiency: number; satisfaction: number }>
}

export default function EnterpriseAnalytics() {
  const [timeRange, setTimeRange] = useState("3months")
  const [department, setDepartment] = useState("all")

  const analyticsData: AnalyticsData = {
    productivity: [
      { month: "Oct", score: 78, meetings: 145 },
      { month: "Nov", score: 82, meetings: 167 },
      { month: "Dec", score: 85, meetings: 134 },
      { month: "Jan", score: 89, meetings: 156 },
    ],
    costs: [
      { department: "Engineering", cost: 12500, meetings: 89 },
      { department: "Product", cost: 8900, meetings: 67 },
      { department: "Marketing", cost: 6700, meetings: 45 },
      { department: "Sales", cost: 9200, meetings: 78 },
      { department: "Design", cost: 4300, meetings: 34 },
    ],
    engagement: [
      { name: "High Engagement", value: 65 },
      { name: "Medium Engagement", value: 25 },
      { name: "Low Engagement", value: 10 },
    ],
    trends: [
      { week: "W1", efficiency: 78, satisfaction: 82 },
      { week: "W2", efficiency: 82, satisfaction: 85 },
      { week: "W3", efficiency: 85, satisfaction: 87 },
      { week: "W4", efficiency: 89, satisfaction: 91 },
    ],
  }

  const COLORS = ["#00bcd4", "#ff6b6b", "#feca57"]

  const exportReport = () => {
    console.log("[v0] Exporting analytics report...")
    // Generate comprehensive analytics report
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Enterprise Analytics Dashboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="bg-transparent" onClick={exportReport}>
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="productivity">Productivity</TabsTrigger>
            <TabsTrigger value="costs">Costs & ROI</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">1,247</div>
                <div className="text-xs text-muted-foreground">Total Meetings</div>
                <Badge variant="outline" className="text-xs mt-1 bg-green-500/20 text-green-400">
                  +12%
                </Badge>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">42.3h</div>
                <div className="text-xs text-muted-foreground">Avg per Person</div>
                <Badge variant="outline" className="text-xs mt-1 bg-yellow-500/20 text-yellow-400">
                  -5%
                </Badge>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">$89K</div>
                <div className="text-xs text-muted-foreground">Total Cost</div>
                <Badge variant="outline" className="text-xs mt-1 bg-blue-500/20 text-blue-400">
                  +3%
                </Badge>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <Award className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">87%</div>
                <div className="text-xs text-muted-foreground">Efficiency Score</div>
                <Badge variant="outline" className="text-xs mt-1 bg-green-500/20 text-green-400">
                  +8%
                </Badge>
              </div>
            </div>

            {/* Engagement Distribution */}
            <div className="p-4 border border-border rounded-lg bg-muted/10">
              <h4 className="font-medium mb-3">Meeting Engagement Distribution</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.engagement}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analyticsData.engagement.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {analyticsData.engagement.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="productivity" className="space-y-4">
            <div className="p-4 border border-border rounded-lg bg-muted/10">
              <h4 className="font-medium mb-3">Productivity Trends</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.productivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#00bcd4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-border rounded-lg bg-muted/10">
                <h5 className="font-medium mb-2">Top Performing Teams</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Engineering</span>
                    <span className="text-green-400">94%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Product</span>
                    <span className="text-green-400">91%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Design</span>
                    <span className="text-blue-400">87%</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg bg-muted/10">
                <h5 className="font-medium mb-2">Improvement Areas</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Meeting Duration</span>
                    <span className="text-yellow-400">-8min avg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Follow-up Rate</span>
                    <span className="text-green-400">+12%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Participation</span>
                    <span className="text-green-400">+15%</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <div className="p-4 border border-border rounded-lg bg-muted/10">
              <h4 className="font-medium mb-3">Cost by Department</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.costs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, "Cost"]} />
                    <Bar dataKey="cost" fill="#ff6b6b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <DollarSign className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">$71</div>
                <div className="text-xs text-muted-foreground">Cost per Meeting</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <Target className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">3.2x</div>
                <div className="text-xs text-muted-foreground">ROI Multiplier</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <TrendingUp className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">$12K</div>
                <div className="text-xs text-muted-foreground">Monthly Savings</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="p-4 border border-border rounded-lg bg-muted/10">
              <h4 className="font-medium mb-3">Efficiency & Satisfaction Trends</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="efficiency" stroke="#00bcd4" strokeWidth={2} />
                    <Line type="monotone" dataKey="satisfaction" stroke="#ff6b6b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#00bcd4]" />
                  <span className="text-xs">Efficiency</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#ff6b6b]" />
                  <span className="text-xs">Satisfaction</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
              <div className="text-sm font-medium">Key Insights:</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Meeting efficiency improved 14% over the last month</li>
                <li>• Participant satisfaction reached all-time high of 91%</li>
                <li>• AI-powered features reduced prep time by 23%</li>
                <li>• Follow-up completion rate increased to 87%</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
