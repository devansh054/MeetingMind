"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Lock, FileText, Download, AlertTriangle, CheckCircle2, Clock } from "lucide-react"

interface SecurityMetric {
  name: string
  status: "compliant" | "warning" | "critical"
  score: number
  description: string
}

interface AuditLog {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  ipAddress: string
  status: "success" | "failed" | "warning"
}

export default function EnterpriseSecurity() {
  const [encryptionEnabled, setEncryptionEnabled] = useState(true)
  const [auditLogging, setAuditLogging] = useState(true)
  const [dataRetention, setDataRetention] = useState(true)
  const [accessControl, setAccessControl] = useState(true)

  const securityMetrics: SecurityMetric[] = [
    {
      name: "End-to-End Encryption",
      status: "compliant",
      score: 100,
      description: "All meeting data encrypted with AES-256",
    },
    {
      name: "Access Control",
      status: "compliant",
      score: 98,
      description: "Role-based permissions properly configured",
    },
    {
      name: "Data Retention",
      status: "warning",
      score: 85,
      description: "Some recordings exceed retention policy",
    },
    {
      name: "Audit Compliance",
      status: "compliant",
      score: 95,
      description: "SOC 2 Type II compliant logging",
    },
    {
      name: "Network Security",
      status: "compliant",
      score: 92,
      description: "TLS 1.3 with certificate pinning",
    },
  ]

  const auditLogs: AuditLog[] = [
    {
      id: "1",
      timestamp: "2024-01-10 14:32:15",
      user: "sarah.chen@company.com",
      action: "Meeting Created",
      resource: "Quarterly Review",
      ipAddress: "192.168.1.100",
      status: "success",
    },
    {
      id: "2",
      timestamp: "2024-01-10 14:30:42",
      user: "marcus.johnson@company.com",
      action: "Recording Downloaded",
      resource: "Team Standup - Jan 9",
      ipAddress: "192.168.1.105",
      status: "success",
    },
    {
      id: "3",
      timestamp: "2024-01-10 14:28:33",
      user: "unknown@external.com",
      action: "Login Attempt",
      resource: "Authentication",
      ipAddress: "203.0.113.45",
      status: "failed",
    },
    {
      id: "4",
      timestamp: "2024-01-10 14:25:18",
      user: "elena.rodriguez@company.com",
      action: "Transcript Accessed",
      resource: "Product Strategy Session",
      ipAddress: "192.168.1.102",
      status: "success",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
      case "success":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "critical":
      case "failed":
        return "text-red-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "critical":
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-400" />
      default:
        return <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
    }
  }

  const exportAuditReport = () => {
    console.log("[v0] Exporting audit report...")
    // Generate and download audit report
  }

  const overallSecurityScore = Math.round(
    securityMetrics.reduce((acc, metric) => acc + metric.score, 0) / securityMetrics.length,
  )

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Enterprise Security & Compliance
          </CardTitle>
          <Badge
            variant="outline"
            className={
              overallSecurityScore >= 95
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : overallSecurityScore >= 85
                  ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
            }
          >
            Security Score: {overallSecurityScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="audit">Audit Logs</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Security Metrics */}
            <div className="space-y-3">
              <h4 className="font-medium">Security Metrics</h4>
              <div className="space-y-3">
                {securityMetrics.map((metric, index) => (
                  <div key={index} className="p-3 border border-border rounded-lg bg-muted/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(metric.status)}
                        <span className="font-medium text-sm">{metric.name}</span>
                      </div>
                      <span className={`text-sm font-bold ${getStatusColor(metric.status)}`}>{metric.score}%</span>
                    </div>
                    <Progress value={metric.score} className="h-2 mb-2" />
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <Lock className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-sm font-medium">256-bit</div>
                <div className="text-xs text-muted-foreground">Encryption</div>
              </div>
              <div className="text-center p-3 bg-muted/20 rounded-lg">
                <FileText className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="text-sm font-medium">SOC 2</div>
                <div className="text-xs text-muted-foreground">Compliant</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label className="font-medium">End-to-End Encryption</Label>
                  <p className="text-xs text-muted-foreground">Encrypt all meeting data and communications</p>
                </div>
                <Switch checked={encryptionEnabled} onCheckedChange={setEncryptionEnabled} />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label className="font-medium">Audit Logging</Label>
                  <p className="text-xs text-muted-foreground">Log all user actions and system events</p>
                </div>
                <Switch checked={auditLogging} onCheckedChange={setAuditLogging} />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label className="font-medium">Data Retention Policy</Label>
                  <p className="text-xs text-muted-foreground">Automatically delete data after retention period</p>
                </div>
                <Switch checked={dataRetention} onCheckedChange={setDataRetention} />
              </div>

              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="space-y-1">
                  <Label className="font-medium">Advanced Access Control</Label>
                  <p className="text-xs text-muted-foreground">Role-based permissions and MFA</p>
                </div>
                <Switch checked={accessControl} onCheckedChange={setAccessControl} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Audit Trail</h4>
              <Button variant="outline" size="sm" className="bg-transparent" onClick={exportAuditReport}>
                <Download className="h-3 w-3 mr-1" />
                Export Report
              </Button>
            </div>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 border border-border rounded-lg bg-muted/10">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className="font-medium text-sm">{log.action}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {log.timestamp}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium">User:</span> {log.user}
                    </div>
                    <div>
                      <span className="font-medium">Resource:</span> {log.resource}
                    </div>
                    <div>
                      <span className="font-medium">IP Address:</span> {log.ipAddress}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      <span className={getStatusColor(log.status)}>{log.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <h5 className="font-medium">SOC 2 Type II</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Comprehensive security controls and audit procedures
                </p>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Certified
                </Badge>
              </div>

              <div className="p-4 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <h5 className="font-medium">GDPR Compliance</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Data protection and privacy rights compliance</p>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Compliant
                </Badge>
              </div>

              <div className="p-4 border border-border rounded-lg bg-muted/10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <h5 className="font-medium">HIPAA Ready</h5>
                </div>
                <p className="text-sm text-muted-foreground mb-2">Healthcare data protection standards</p>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  Available
                </Badge>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
              <div className="text-sm font-medium">Compliance Features:</div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Automated data classification and labeling</li>
                <li>• Configurable data retention policies</li>
                <li>• Right to be forgotten implementation</li>
                <li>• Regular security assessments and penetration testing</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
