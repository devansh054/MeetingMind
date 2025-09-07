import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Lock, 
  Users, 
  Activity,
  CheckCircle,
  Key,
  FileText,
  Clock,
  Database
} from "lucide-react";

interface SecurityDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalMeetings: number;
  uptime: number;
}

const SecurityDashboardModal: React.FC<SecurityDashboardModalProps> = ({
  isOpen,
  onClose,
  totalMeetings,
  uptime
}) => {
  const securityMetrics = {
    encryptedMeetings: totalMeetings,
    activeUsers: 12,
    securityIncidents: 0,
    lastAudit: "2024-09-01",
    certificateExpiry: "2025-03-15",
    dataRetentionDays: 90
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[98vw] !h-[98vh] !max-w-none !max-h-none overflow-y-auto glass-strong border border-white/20 !sm:w-[98vw] !sm:max-w-none">
        <DialogHeader className="pb-4 border-b border-white/20">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Enterprise Security Dashboard
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Security Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="glass border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Lock className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Encrypted Meetings</p>
                    <p className="text-lg font-semibold text-white">{securityMetrics.encryptedMeetings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Active Users</p>
                    <p className="text-lg font-semibold text-white">{securityMetrics.activeUsers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Activity className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">System Uptime</p>
                    <p className="text-lg font-semibold text-white">{uptime.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Security Incidents</p>
                    <p className="text-lg font-semibold text-white">{securityMetrics.securityIncidents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Encryption & Compliance */}
            <Card className="glass border border-white/20">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Encryption & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">End-to-End Encryption</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">GDPR Compliance</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Compliant
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">SOC 2 Type II</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Certified
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Data Retention</span>
                  <span className="text-sm text-white">{securityMetrics.dataRetentionDays} days</span>
                </div>
              </CardContent>
            </Card>

            {/* Access Control */}
            <Card className="glass border border-white/20">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">Two-Factor Authentication</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">SSO Integration</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">Role-Based Access</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">Session Timeout</span>
                  <span className="text-sm text-white">24 hours</span>
                </div>
              </CardContent>
            </Card>

            {/* Audit & Monitoring */}
            <Card className="glass border border-white/20">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Audit & Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">Last Security Audit</span>
                  <span className="text-sm text-white shrink-0">{securityMetrics.lastAudit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">Audit Logs</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">Real-time Monitoring</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">Threat Detection</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Infrastructure */}
            <Card className="glass border border-white/20">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Infrastructure Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">SSL Certificate</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">Certificate Expiry</span>
                  <span className="text-sm text-white shrink-0">{securityMetrics.certificateExpiry}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">Firewall Status</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Protected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80 truncate mr-2">DDoS Protection</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Security Events */}
          <Card className="glass border border-white/20">
            <CardHeader>
              <CardTitle className="text-base text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm text-white">Security audit completed successfully</p>
                    <p className="text-xs text-white/60">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Key className="h-4 w-4 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm text-white">SSL certificate renewed</p>
                    <p className="text-xs text-white/60">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <Shield className="h-4 w-4 text-green-400" />
                  <div className="flex-1">
                    <p className="text-sm text-white">System security update applied</p>
                    <p className="text-xs text-white/60">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Download Report
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-white px-6"
              >
                Security Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityDashboardModal;
