"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Plus, Settings, Play, Pause, RotateCcw, Brain, Clock, MessageSquare, Video } from "lucide-react"

interface Participant {
  id: string
  name: string
  avatar: string
  status: "online" | "speaking" | "muted"
}

interface BreakoutRoom {
  id: string
  name: string
  participants: Participant[]
  topic: string
  duration: number
  status: "active" | "paused" | "ended"
  aiSuggestion?: string
}

interface BreakoutRoomsProps {
  participants?: Participant[]
  user?: { firstName?: string; lastName?: string; id?: string }
  onRoomCreate?: (room: BreakoutRoom) => void
  onRoomJoin?: (roomId: string, userId: string) => void
  onRoomUpdate?: (rooms: BreakoutRoom[]) => void
}

export default function BreakoutRooms({ 
  participants = [], 
  user, 
  onRoomCreate, 
  onRoomJoin, 
  onRoomUpdate 
}: BreakoutRoomsProps) {
  const [rooms, setRooms] = useState<BreakoutRoom[]>([])

  const [isCreating, setIsCreating] = useState(false)
  const [newRoomName, setNewRoomName] = useState("")
  const [newRoomTopic, setNewRoomTopic] = useState("")
  const [newRoomDuration, setNewRoomDuration] = useState(15)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  // Use provided participants or fallback to empty array
  const allParticipants = participants.length > 0 ? participants : []

  const createAIRooms = () => {
    if (allParticipants.length < 2) {
      console.log('Need at least 2 participants to create breakout rooms')
      return
    }

    // AI-powered room creation based on participant count
    const roomCount = Math.min(Math.ceil(allParticipants.length / 3), 4)
    const participantsPerRoom = Math.ceil(allParticipants.length / roomCount)
    
    const aiRooms: BreakoutRoom[] = []
    const topics = [
      { name: "Technical Discussion", suggestion: "Focus on architecture decisions and technical constraints" },
      { name: "Business Strategy", suggestion: "Discuss ROI and market positioning" },
      { name: "Creative Brainstorming", suggestion: "Generate innovative ideas and solutions" },
      { name: "Implementation Planning", suggestion: "Define actionable next steps and timelines" }
    ]

    for (let i = 0; i < roomCount; i++) {
      const startIndex = i * participantsPerRoom
      const endIndex = Math.min(startIndex + participantsPerRoom, allParticipants.length)
      const roomParticipants = allParticipants.slice(startIndex, endIndex)
      
      if (roomParticipants.length > 0) {
        const topic = topics[i % topics.length]
        const newRoom: BreakoutRoom = {
          id: `ai-${Date.now()}-${i}`,
          name: `AI Room ${i + 1}: ${topic.name}`,
          participants: roomParticipants,
          topic: topic.name,
          duration: 20,
          status: "active",
          aiSuggestion: topic.suggestion
        }
        aiRooms.push(newRoom)
      }
    }
    
    setRooms(aiRooms)
    onRoomUpdate?.(aiRooms)
  }

  const joinRoom = (roomId: string) => {
    const userId = user?.id || 'current-user'
    console.log('Joining breakout room:', roomId, 'User:', userId)
    onRoomJoin?.(roomId, userId)
    // Navigate to breakout room interface
  }

  const endAllRooms = () => {
    const updatedRooms = rooms.map((room) => ({ ...room, status: "ended" as const }))
    setRooms(updatedRooms)
    onRoomUpdate?.(updatedRooms)
  }

  const createRoom = () => {
    if (!newRoomName.trim() || selectedParticipants.length === 0) {
      console.log('Room name and participants are required')
      return
    }

    const roomParticipants = allParticipants.filter(p => selectedParticipants.includes(p.id))
    const newRoom: BreakoutRoom = {
      id: `room-${Date.now()}`,
      name: newRoomName,
      participants: roomParticipants,
      topic: newRoomTopic || 'General Discussion',
      duration: newRoomDuration,
      status: 'active'
    }

    const updatedRooms = [...rooms, newRoom]
    setRooms(updatedRooms)
    onRoomCreate?.(newRoom)
    onRoomUpdate?.(updatedRooms)

    // Reset form
    setNewRoomName('')
    setNewRoomTopic('')
    setNewRoomDuration(15)
    setSelectedParticipants([])
    setIsCreating(false)
  }

  const pauseRoom = (roomId: string) => {
    const updatedRooms = rooms.map(room => 
      room.id === roomId ? { ...room, status: 'paused' as const } : room
    )
    setRooms(updatedRooms)
    onRoomUpdate?.(updatedRooms)
  }

  const resumeRoom = (roomId: string) => {
    const updatedRooms = rooms.map(room => 
      room.id === roomId ? { ...room, status: 'active' as const } : room
    )
    setRooms(updatedRooms)
    onRoomUpdate?.(updatedRooms)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "paused":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "ended":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-600 text-white"
    }
  }

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Breakout Rooms
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-transparent" onClick={createAIRooms}>
              <Brain className="h-3 w-3 mr-1" />
              AI Create
            </Button>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-transparent">
                  <Plus className="h-3 w-3 mr-1" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong">
                <DialogHeader>
                  <DialogTitle>Create Breakout Room</DialogTitle>
                  <DialogDescription>Set up a new breakout room for focused discussions</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="room-name">Room Name</Label>
                    <Input
                      id="room-name"
                      placeholder="Enter room name..."
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-topic">Discussion Topic (Optional)</Label>
                    <Input
                      id="room-topic"
                      placeholder="What will this room discuss?"
                      value={newRoomTopic}
                      onChange={(e) => setNewRoomTopic(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room-duration">Duration (minutes)</Label>
                    <Input
                      id="room-duration"
                      type="number"
                      min="5"
                      max="60"
                      value={newRoomDuration}
                      onChange={(e) => setNewRoomDuration(parseInt(e.target.value) || 15)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Select Participants</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {allParticipants.map((participant) => (
                        <div key={participant.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted/20">
                          <input
                            type="checkbox"
                            checked={selectedParticipants.includes(participant.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedParticipants((prev) => [...prev, participant.id])
                              } else {
                                setSelectedParticipants((prev) => prev.filter((id) => id !== participant.id))
                              }
                            }}
                          />
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {participant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{participant.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1" onClick={createRoom}>
                      Create Room
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Room Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-transparent">
            <Play className="h-3 w-3 mr-1" />
            Start All
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Pause className="h-3 w-3 mr-1" />
            Pause All
          </Button>
          <Button variant="outline" size="sm" className="bg-transparent" onClick={endAllRooms}>
            <RotateCcw className="h-3 w-3 mr-1" />
            End All
          </Button>
        </div>

        {/* Active Rooms */}
        <div className="space-y-3">
          {rooms.map((room) => (
            <div key={room.id} className="p-3 border border-border rounded-lg bg-muted/10">
              <div className="flex items-start justify-between mb-2">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{room.name}</h4>
                  <p className="text-xs text-muted-foreground">{room.topic}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(room.status)}>
                    {room.status}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {room.duration}m
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex -space-x-2">
                  {room.participants.map((participant) => (
                    <Avatar key={participant.id} className="h-6 w-6 border-2 border-background">
                      <AvatarImage src={participant.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{room.participants.length} participants</span>
              </div>

              {/* AI Suggestion */}
              {room.aiSuggestion && (
                <div className="p-2 bg-primary/10 rounded text-xs mb-2">
                  <div className="flex items-center gap-1 font-medium mb-1">
                    <Brain className="h-3 w-3 text-primary" />
                    AI Suggestion
                  </div>
                  <p className="text-muted-foreground">{room.aiSuggestion}</p>
                </div>
              )}

              {/* Room Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs bg-transparent"
                  onClick={() => joinRoom(room.id)}
                >
                  <Video className="h-3 w-3 mr-1" />
                  Join
                </Button>
                {room.status === 'active' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-xs bg-transparent"
                    onClick={() => pauseRoom(room.id)}
                  >
                    <Pause className="h-3 w-3 mr-1" />
                    Pause
                  </Button>
                ) : room.status === 'paused' ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-6 text-xs bg-transparent"
                    onClick={() => resumeRoom(room.id)}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Resume
                  </Button>
                ) : null}
                <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Chat
                </Button>
                <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                  <Settings className="h-3 w-3 mr-1" />
                  Settings
                </Button>
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">No breakout rooms active</p>
            <p className="text-xs text-muted-foreground">Create rooms to enable focused group discussions</p>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
          <div className="text-sm font-medium">Breakout Room Features:</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• AI automatically suggests optimal room configurations</li>
            <li>• Real-time monitoring of room activities and engagement</li>
            <li>• Automatic note-taking and summary generation per room</li>
            <li>• Seamless transition back to main meeting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
