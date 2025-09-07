"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Brain, MessageSquare, FileText, Users, Volume2, VolumeX } from "lucide-react"

interface VoiceCommand {
  command: string
  action: string
  timestamp: string
  status: "processing" | "completed" | "failed"
}

interface VoiceCommandInterfaceProps {
  onCommand?: (command: string) => void
}

export default function VoiceCommandInterface({ onCommand }: VoiceCommandInterfaceProps) {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentCommand, setCurrentCommand] = useState("")
  const [recentCommands, setRecentCommands] = useState<VoiceCommand[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("")

        setCurrentCommand(transcript)

        if (event.results[event.results.length - 1].isFinal) {
          processCommand(transcript)
        }
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const processCommand = (command: string) => {
    setIsProcessing(true)

    const newCommand: VoiceCommand = {
      command,
      action: getActionFromCommand(command),
      timestamp: new Date().toLocaleTimeString(),
      status: "processing",
    }

    setRecentCommands((prev) => [newCommand, ...prev.slice(0, 4)])

    // Simulate processing
    setTimeout(() => {
      setRecentCommands((prev) => prev.map((cmd, index) => (index === 0 ? { ...cmd, status: "completed" } : cmd)))
      setIsProcessing(false)
      setCurrentCommand("")
      onCommand?.(command)
    }, 2000)
  }

  const getActionFromCommand = (command: string): string => {
    const lowerCommand = command.toLowerCase()

    if (lowerCommand.includes("summarize") || lowerCommand.includes("summary")) {
      return "Generate meeting summary"
    }
    if (lowerCommand.includes("action item") || lowerCommand.includes("task")) {
      return "Create action item"
    }
    if (lowerCommand.includes("transcript") || lowerCommand.includes("notes")) {
      return "Show transcript"
    }
    if (lowerCommand.includes("mute") || lowerCommand.includes("unmute")) {
      return "Toggle audio"
    }
    if (lowerCommand.includes("record") || lowerCommand.includes("recording")) {
      return "Control recording"
    }
    if (lowerCommand.includes("invite") || lowerCommand.includes("add")) {
      return "Manage participants"
    }

    return "Process voice command"
  }

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    } else {
      recognitionRef.current?.start()
      setIsListening(true)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <div className="animate-spin h-3 w-3 border border-primary border-t-transparent rounded-full" />
      case "completed":
        return <div className="h-3 w-3 bg-green-400 rounded-full" />
      case "failed":
        return <div className="h-3 w-3 bg-red-400 rounded-full" />
      default:
        return null
    }
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Voice Commands
        </CardTitle>
        <p className="text-sm text-muted-foreground">Say "Hey Meeting Mind" followed by your command</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Control */}
        <div className="flex items-center gap-3">
          <Button
            onClick={toggleListening}
            variant={isListening ? "default" : "outline"}
            size="sm"
            className={isListening ? "bg-red-500 hover:bg-red-600" : "bg-transparent"}
          >
            {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>

          <Button onClick={() => setIsMuted(!isMuted)} variant="outline" size="sm" className="bg-transparent">
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>

          <Badge
            variant={isListening ? "default" : "secondary"}
            className={isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-600 text-white"}
          >
            {isListening ? "Listening..." : "Ready"}
          </Badge>
        </div>

        {/* Current Command */}
        {(currentCommand || isProcessing) && (
          <div className="p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <MessageSquare className="h-3 w-3" />
              {isProcessing ? "Processing..." : "Listening..."}
            </div>
            <p className="text-sm text-muted-foreground">{currentCommand || "Processing your command..."}</p>
          </div>
        )}

        {/* Recent Commands */}
        {recentCommands.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Recent Commands</h4>
            <div className="space-y-2">
              {recentCommands.map((cmd, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-muted/10 rounded">
                  {getStatusIcon(cmd.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{cmd.command}</p>
                    <p className="text-xs text-muted-foreground">{cmd.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{cmd.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Commands */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Commands</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-xs h-8"
              onClick={() => processCommand("Summarize the last 5 minutes")}
            >
              <FileText className="h-3 w-3 mr-1" />
              Summarize
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-xs h-8"
              onClick={() => processCommand("Create action item for Sarah")}
            >
              <Users className="h-3 w-3 mr-1" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Command Examples */}
        <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
          <div className="text-sm font-medium">Example Commands:</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• "Summarize the last 10 minutes"</li>
            <li>• "Create action item for John"</li>
            <li>• "Show meeting transcript"</li>
            <li>• "Mute my microphone"</li>
            <li>• "Start recording"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
