import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Phone,
  Users,
  MessageSquare,
  Brain,
  Clock,
  FileText,
  Award,
  PenTool,
  Presentation,
  UserPlus,
  Zap,
} from "lucide-react"
import AIInsightsPanel from "@/components/ai-insights-panel"
import EnhancedTranscript from "@/components/enhanced-transcript"
import RealTimeChat from "@/components/real-time-chat"
import NotificationSystem from "@/components/notification-system"
import MeetingPerformanceScorer from "@/components/meeting-performance-scorer"
import VoiceCommandInterface from "@/components/voice-command-interface"
import PredictiveInsights from "@/components/predictive-insights"
import VirtualWhiteboard from "@/components/virtual-whiteboard"
import ScreenAnnotation from "@/components/screen-annotation"
import MeetingCostCalculator from "@/components/meeting-cost-calculator"
import BreakoutRooms from "@/components/breakout-rooms"
import { GearIcon, PlusIcon, ArrowLeftIcon, ComponentPlaceholderIcon } from "@radix-ui/react-icons"

export default function MeetingInterface() {
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [activeTab, setActiveTab] = useState("team")
  const [isAIProcessing, setIsAIProcessing] = useState(false)
  const [showWhiteboard, setShowWhiteboard] = useState(false)
  const [showAnnotation, setShowAnnotation] = useState(false)
  const [showBreakoutRooms, setShowBreakoutRooms] = useState(false)
  const [showCostCalculator, setShowCostCalculator] = useState(false)

  const handleVoiceCommand = (command: string) => {
    console.log("[v0] Voice command received:", command)
    // Process voice commands here
    if (command.toLowerCase().includes("summarize")) {
      setActiveTab("ai")
      setIsAIProcessing(true)
    }
  }

  const participants = [
    { id: 1, name: "Sarah Chen", avatar: "/professional-woman-diverse.png", status: "speaking", role: "Host" },
    { id: 2, name: "Marcus Johnson", avatar: "/professional-man.png", status: "online", role: "Participant" },
    {
      id: 3,
      name: "Elena Rodriguez",
      avatar: "/professional-woman-diverse.png",
      status: "online",
      role: "Participant",
    },
    { id: 4, name: "David Kim", avatar: "/professional-man.png", status: "muted", role: "Participant" },
  ]

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Meeting Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="font-semibold">Quarterly Business Review</h1>
              <p className="text-sm text-muted-foreground">Hosted by Sarah Chen</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationSystem />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("[v0] Opening whiteboard dialog")
                setShowWhiteboard(true)
              }}
              className="bg-transparent"
            >
              <PenTool className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("[v0] Opening annotation dialog")
                setShowAnnotation(true)
              }}
              className="bg-transparent"
            >
              <Presentation className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("[v0] Opening breakout rooms dialog")
                setShowBreakoutRooms(true)
              }}
              className="bg-transparent"
            >
              <UserPlus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log("[v0] Opening cost calculator dialog")
                setShowCostCalculator(true)
              }}
              className="bg-transparent"
            >
              <ComponentPlaceholderIcon className="h-4 w-4" />
            </Button>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              Recording
            </Badge>
            <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              AI Active
            </Badge>
            <span className="text-sm font-medium">45:23</span>
          </div>
        </div>
      </header>

      {/* Main Meeting Area */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Feed */}
          <div className="flex-1 relative bg-muted/20 rounded-lg m-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5">
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Video className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">Camera feed will appear here</p>
                </div>
              </div>
            </div>

            {/* Participant Grid Overlay */}
            <div className="absolute top-4 right-4 grid grid-cols-2 gap-2">
              {participants.slice(0, 4).map((participant) => (
                <div key={participant.id} className="glass rounded-lg p-2 w-32 h-24 flex items-center justify-center">
                  <div className="text-center">
                    <Avatar className="h-8 w-8 mx-auto mb-1">
                      <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-xs text-foreground/80 truncate">{participant.name.split(" ")[0]}</p>
                    {participant.status === "speaking" && (
                      <div className="flex justify-center mt-1">
                        <div className="flex gap-1">
                          <div className="h-1 w-1 bg-green-400 rounded-full animate-pulse" />
                          <div className="h-1 w-1 bg-green-400 rounded-full animate-pulse delay-75" />
                          <div className="h-1 w-1 bg-green-400 rounded-full animate-pulse delay-150" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Live Transcript Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <Card className="glass p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Live Transcript</span>
                    <Badge variant="outline" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                      AI Enhanced
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Full View
                  </Button>
                </div>
                <ScrollArea className="h-20">
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium text-primary">Sarah Chen:</span>{" "}
                      <span className="text-foreground/90">
                        "Welcome everyone to our quarterly review meeting. Today we'll be discussing our performance
                        metrics and planning for the upcoming quarter..."
                      </span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Action Item Detected
                      </Badge>
                      <span className="text-xs text-muted-foreground">Confidence: 94%</span>
                    </div>
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>

          {/* Meeting Controls */}
          <div className="p-4">
            <Card className="glass-strong p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isAudioOn ? "default" : "destructive"}
                    size="sm"
                    onClick={() => setIsAudioOn(!isAudioOn)}
                    className="rounded-full h-12 w-12"
                  >
                    {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                  <Button
                    variant={isVideoOn ? "default" : "destructive"}
                    size="sm"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className="rounded-full h-12 w-12"
                  >
                    {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full h-12 w-12 bg-transparent">
                    <Monitor className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full h-12 w-12 bg-transparent">
                    <GearIcon className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">45:23</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAIProcessing(!isAIProcessing)}
                    className="bg-transparent"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {isAIProcessing ? "Processing..." : "AI Analyze"}
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Zap className="h-4 w-4 mr-2" />
                    Tools
                  </Button>
                </div>

                <Button variant="destructive" size="sm" className="rounded-full">
                  <Phone className="h-4 w-4 mr-2" />
                  End Meeting
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-border/50 bg-sidebar/50 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 m-4 mb-0">
              <TabsTrigger value="team" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Team
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-1">
                <Brain className="h-3 w-3" />
                AI
              </TabsTrigger>
              <TabsTrigger value="transcript" className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Score
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="team" className="mt-2 space-y-4 h-full p-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Participants ({participants.length})</h3>
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                </div>

                <ScrollArea className="h-[calc(100vh-200px)]">
                  <div className="space-y-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/10 transition-colors"
                      >
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {participant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background ${
                              participant.status === "speaking"
                                ? "bg-green-500 animate-pulse"
                                : participant.status === "online"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{participant.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {participant.role}
                            </Badge>
                            {participant.status === "speaking" && (
                              <span className="text-xs text-green-400">Speaking</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="chat" className="mt-2 h-full">
                <RealTimeChat />
              </TabsContent>

              <TabsContent value="ai" className="mt-2 h-full overflow-hidden">
                <ScrollArea className="h-[calc(100vh-160px)] p-4 pt-2">
                  <div className="space-y-4">
                    <AIInsightsPanel isProcessing={isAIProcessing} />
                    <VoiceCommandInterface onCommand={handleVoiceCommand} />
                    <PredictiveInsights />
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="transcript" className="mt-2 h-full overflow-hidden">
                <ScrollArea className="h-[calc(100vh-160px)] p-4 pt-2">
                  <EnhancedTranscript />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="performance" className="mt-2 h-full overflow-hidden">
                <ScrollArea className="h-[calc(100vh-160px)] p-4 pt-2">
                  <MeetingPerformanceScorer isLive={true} />
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <Dialog open={showWhiteboard} onOpenChange={setShowWhiteboard}>
        <DialogContent className="glass-strong max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Virtual Whiteboard</DialogTitle>
            <DialogDescription>Collaborative drawing with AI shape recognition</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {console.log("[v0] Rendering VirtualWhiteboard component")}
            <VirtualWhiteboard />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAnnotation} onOpenChange={setShowAnnotation}>
        <DialogContent className="glass-strong max-w-3xl">
          <DialogHeader>
            <DialogTitle>Screen Annotation</DialogTitle>
            <DialogDescription>Real-time markup tools for presentations</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden">
            {console.log("[v0] Rendering ScreenAnnotation component")}
            <ScreenAnnotation />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBreakoutRooms} onOpenChange={setShowBreakoutRooms}>
        <DialogContent className="glass-strong max-w-2xl">
          <DialogHeader>
            <DialogTitle>Breakout Rooms</DialogTitle>
            <DialogDescription>AI-powered room management</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden">
            {console.log("[v0] Rendering BreakoutRooms component")}
            <BreakoutRooms />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCostCalculator} onOpenChange={setShowCostCalculator}>
        <DialogContent className="glass-strong max-w-xl">
          <DialogHeader>
            <DialogTitle>Meeting Cost Calculator</DialogTitle>
            <DialogDescription>Real-time ROI and efficiency tracking</DialogDescription>
          </DialogHeader>
          <div className="overflow-hidden">
            {console.log("[v0] Rendering MeetingCostCalculator component")}
            <MeetingCostCalculator />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
