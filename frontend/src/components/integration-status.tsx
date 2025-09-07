"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Clock, ExternalLink } from "lucide-react"

interface IntegrationStatusProps {
  integrations: Array<{
    name: string
    status: "connected" | "disconnected" | "error"
    lastSync?: string
    icon: any
  }>
}

export default function IntegrationStatus({ integrations }: IntegrationStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-white bg-green-600 border-green-600"
      case "error":
        return "text-white bg-red-600 border-red-600"
      default:
        return "text-white bg-slate-600 border-slate-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-3 w-3" />
      case "error":
        return <AlertCircle className="h-3 w-3" />
      default:
        return <Clock className="h-3 w-3" />
    }
  }

  return (
    <Card className="glass">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">Integration Status</h3>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            <ExternalLink className="h-3 w-3 mr-1" />
            Manage
          </Button>
        </div>
        <div className="space-y-2">
          {integrations.map((integration, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <integration.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{integration.name}</span>
              </div>
              <Badge variant="outline" className={`text-xs ${getStatusColor(integration.status)}`}>
                {getStatusIcon(integration.status)}
                <span className="ml-1 capitalize">{integration.status}</span>
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
