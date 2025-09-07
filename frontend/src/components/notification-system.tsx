"use client"

import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { X, Bell, MessageSquare, Brain, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { RootState } from "@/store/index"

interface Notification {
  id: string
  type: "meeting" | "message" | "ai" | "system" | "welcome" | "reminder"
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionable?: boolean
  avatar?: string
  user?: string
  priority?: "low" | "medium" | "high"
}

export default function NotificationSystem() {
  const { user } = useSelector((state: RootState) => state.auth)
  const { meetings } = useSelector((state: RootState) => state.meeting)
  
  const generatePersonalizedNotifications = (): Notification[] => {
    const notifications: Notification[] = []
    const now = new Date()
    
    // Check if user is new (created within last 24 hours)
    const isNewUser = user?.createdAt ? (now.getTime() - new Date(user.createdAt).getTime()) < 24 * 60 * 60 * 1000 : false
    
    if (isNewUser) {
      // Welcome message for new users
      notifications.push({
        id: "welcome-new",
        type: "welcome",
        title: `Welcome to MeetingMind, ${user?.firstName || 'there'}! 🎉`,
        message: "Get started by creating your first meeting or exploring AI-powered insights. We're here to make your meetings more productive!",
        timestamp: new Date(now.getTime() - 1000),
        read: false,
        priority: "high",
        actionable: true
      })
    } else {
      // Welcome back message for returning users
      notifications.push({
        id: "welcome-back",
        type: "system",
        title: `Welcome back, ${user?.firstName || 'there'}! 👋`,
        message: "Ready to make today's meetings more productive? Check your upcoming schedule and recent insights below.",
        timestamp: new Date(now.getTime() - 2000),
        read: false,
        priority: "medium"
      })
    }
    
    // Check for upcoming meetings (next 2 hours)
    const upcomingMeetings = meetings?.filter((meeting: any) => {
      if (!meeting.scheduledAt) return false
      const meetingTime = new Date(meeting.scheduledAt).getTime()
      const twoHoursFromNow = now.getTime() + (2 * 60 * 60 * 1000)
      return meetingTime > now.getTime() && meetingTime <= twoHoursFromNow
    }) || []
    
    upcomingMeetings.forEach((meeting: any, index: number) => {
      const timeUntil = Math.floor((new Date(meeting.scheduledAt!).getTime() - now.getTime()) / (60 * 1000))
      notifications.push({
        id: `upcoming-${meeting.id}`,
        type: "meeting",
        title: timeUntil <= 15 ? "Meeting starting soon!" : "Upcoming meeting reminder",
        message: `${meeting.title} ${timeUntil <= 15 ? `starts in ${timeUntil} minutes` : `in ${Math.floor(timeUntil / 60)}h ${timeUntil % 60}m`}`,
        timestamp: new Date(now.getTime() - (3000 + index * 1000)),
        read: false,
        priority: timeUntil <= 15 ? "high" : "medium",
        actionable: true
      })
    })
    
    // Check for recent completed meetings without insights
    const recentCompletedMeetings = meetings?.filter((meeting: any) => {
      if (meeting.status !== 'completed') return false
      const meetingTime = new Date(meeting.updatedAt || meeting.createdAt).getTime()
      const oneDayAgo = now.getTime() - (24 * 60 * 60 * 1000)
      return meetingTime > oneDayAgo
    }) || []
    
    if (recentCompletedMeetings.length > 0) {
      notifications.push({
        id: "insights-available",
        type: "ai",
        title: "AI Insights Available! 🧠",
        message: `${recentCompletedMeetings.length} recent meeting${recentCompletedMeetings.length > 1 ? 's have' : ' has'} AI-generated summaries and action items ready for review.`,
        timestamp: new Date(now.getTime() - 4000),
        read: false,
        priority: "medium",
        actionable: true
      })
    }
    
    // Check for overdue action items (mock data for now)
    const hasOverdueItems = Math.random() > 0.7 // Simulate some users having overdue items
    if (hasOverdueItems && !isNewUser) {
      notifications.push({
        id: "overdue-actions",
        type: "reminder",
        title: "Action Items Need Attention ⚠️",
        message: "You have 2 overdue action items from previous meetings. Review and update their status.",
        timestamp: new Date(now.getTime() - 5000),
        read: false,
        priority: "high",
        actionable: true
      })
    }
    
    // Weekly summary for active users
    const dayOfWeek = now.getDay()
    if (dayOfWeek === 1 && !isNewUser) { // Monday
      notifications.push({
        id: "weekly-summary",
        type: "ai",
        title: "Weekly Meeting Summary 📊",
        message: "Last week: 5 meetings, 12 action items completed, 94% meeting efficiency. Great work!",
        timestamp: new Date(now.getTime() - 6000),
        read: false,
        priority: "low",
        actionable: true
      })
    }
    
    return notifications
  }
  
  const [notifications, setNotifications] = useState<Notification[]>(generatePersonalizedNotifications())

  const [showNotifications, setShowNotifications] = useState(false)

  // Refresh notifications when user or meetings change
  useEffect(() => {
    setNotifications(generatePersonalizedNotifications())
  }, [user, meetings])
  
  // Simulate occasional new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const notificationTypes = [
          {
            type: "message" as const,
            title: "New message from Elena Rodriguez",
            message: "I've reviewed the budget proposal - looks good!",
            avatar: "/professional-woman-diverse.png",
            user: "Elena Rodriguez"
          },
          {
            type: "ai" as const,
            title: "AI Analysis Complete",
            message: "Meeting insights and action items have been generated",
            actionable: true
          },
          {
            type: "meeting" as const,
            title: "Meeting room changed",
            message: "Product Strategy Session moved to Conference Room B",
            actionable: true
          }
        ]
        
        const randomNotif = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
        const newNotification: Notification = {
          id: Date.now().toString(),
          ...randomNotif,
          timestamp: new Date(),
          read: false,
          priority: "medium"
        }

        setNotifications((prev) => [newNotification, ...prev])

        // Show toast notification
        toast({
          title: newNotification.title,
          description: newNotification.message,
        })
      }
    }, 20000)

    return () => clearInterval(interval)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const handleNotificationAction = (notification: Notification) => {
    // Mark as read when action is taken
    markAsRead(notification.id)
    
    // Handle different notification types
    switch (notification.type) {
      case "welcome":
        // Navigate to create meeting or show onboarding
        toast({
          title: "Getting Started",
          description: "Click 'Create Meeting' to schedule your first meeting!",
        })
        break
      case "meeting":
        // Navigate to meeting or show meeting details
        toast({
          title: "Meeting Action",
          description: "Opening meeting details...",
        })
        break
      case "ai":
        // Open AI insights modal or navigate to insights
        toast({
          title: "AI Insights",
          description: "Opening AI insights report...",
        })
        break
      case "reminder":
        // Open action items or task management
        toast({
          title: "Action Items",
          description: "Opening action items dashboard...",
        })
        break
      default:
        toast({
          title: "Notification",
          description: "Action completed",
        })
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "ai":
        return <Brain className="h-4 w-4" />
      case "meeting":
        return <Calendar className="h-4 w-4" />
      case "welcome":
        return <CheckCircle className="h-4 w-4" />
      case "reminder":
        return <AlertCircle className="h-4 w-4" />
      case "system":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = (type: string, priority?: string) => {
    if (priority === "high") {
      return "text-red-400 bg-red-500/20"
    }
    
    switch (type) {
      case "message":
        return "text-blue-400 bg-blue-500/20"
      case "ai":
        return "text-purple-400 bg-purple-500/20"
      case "meeting":
        return "text-green-400 bg-green-500/20"
      case "welcome":
        return "text-emerald-400 bg-emerald-500/20"
      case "reminder":
        return "text-orange-400 bg-orange-500/20"
      case "system":
        return "text-cyan-400 bg-cyan-500/20"
      default:
        return "text-gray-400 bg-gray-500/20"
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return timestamp.toLocaleDateString()
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="outline"
        size="sm"
        className="bg-transparent relative"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notifications Panel */}
      {showNotifications && (
        <Card className="absolute right-0 top-12 w-80 max-h-96 glass-strong border z-50">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowNotifications(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-accent/10 transition-colors cursor-pointer group ${
                      !notification.read ? "bg-accent/5" : ""
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {notification.avatar ? (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={notification.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {notification.user
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center ${getNotificationColor(notification.type, notification.priority)}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          {!notification.read && <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {notification.actionable && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleNotificationAction(notification)
                              }}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeNotification(notification.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-border/50">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all notifications
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
