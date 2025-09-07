"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from 'react-redux'
import { Button } from "@/components/ui/button"
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
  Settings,
  Phone,
  Users,
  ArrowLeft,
  PenTool,
  Presentation,
  UserPlus,
  Calculator,
} from "lucide-react"

import AIInsightsPanel from "@/components/ai-insights-panel"
import NotificationSystem from "@/components/notification-system"
import VirtualWhiteboard from "@/components/virtual-whiteboard"
import MeetingCostCalculator from "@/components/meeting-cost-calculator"
import ScreenAnnotation from "@/components/screen-annotation"
import BreakoutRooms from "@/components/breakout-rooms"
import { RootState } from '../store'

export default function V0MeetingInterface() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentMeeting } = useSelector((state: RootState) => state.meeting)

  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [activeTab, setActiveTab] = useState("team")
  const [showWhiteboard, setShowWhiteboard] = useState(false)
  const [showCostCalculator, setShowCostCalculator] = useState(false)
  const [meetingCost, setMeetingCost] = useState(0)
  const [costEfficiency, setCostEfficiency] = useState(0)
  const [startTime] = useState(Date.now())
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)
  const [transcript, setTranscript] = useState<Array<{speaker: string, text: string, timestamp: Date}>>([]) 
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const lastRestartTime = useRef<number>(0)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showScreenShareDialog, setShowScreenShareDialog] = useState(false)

  useEffect(() => {
    if (id) {
      console.log('Joining meeting:', id)
      initializeMediaDevices()
    }

    return () => {
      console.log('Leaving meeting:', id)
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
      // Clean up speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
          recognitionRef.current = null
        } catch (e) {
          console.log('Error stopping recognition:', e)
        }
      }
    }
  }, [id])

  const initializeMediaDevices = async () => {
    try {
      setConnectionStatus('connecting')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true
      })
      setVideoStream(stream)
      setConnectionStatus('connected')
      
      if (videoRef) {
        videoRef.srcObject = stream
      }
      
      // Initialize speech recognition
      initializeSpeechRecognition()
    } catch (error) {
      console.error('Error accessing media devices:', error)
      setConnectionStatus('disconnected')
    }
  }

  const initializeSpeechRecognition = () => {
    console.log('Initializing speech recognition...')
    console.log('Protocol:', location.protocol)
    console.log('Hostname:', location.hostname)
    console.log('SpeechRecognition available:', 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    console.log('User agent:', navigator.userAgent)
    
    // Check if recognition is already running
    if (recognitionRef.current) {
      console.log('Speech recognition already initialized')
      return
    }
    
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.error('Speech recognition requires HTTPS or localhost')
      return
    }

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognitionInstance = new SpeechRecognition()
      
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'

      recognitionInstance.onstart = () => {
        setIsListening(true)
        console.log('Speech recognition started')
      }

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          const newEntry = {
            speaker: user ? `${user.firstName} ${user.lastName}` : 'You',
            text: finalTranscript.trim(),
            timestamp: new Date()
          }
          setTranscript(prev => [...prev, newEntry])
          console.log('Final transcript:', finalTranscript)
        }
      }

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        
        if (event.error === 'not-allowed') {
          console.error('Microphone access denied')
          alert('Microphone access denied. Please allow microphone access and refresh the page.')
        } else if (event.error === 'aborted') {
          console.log('Speech recognition aborted - stopping restart cycle')
          recognitionRef.current = null
          return
        } else if (event.error === 'no-speech') {
          console.log('No speech detected, will restart automatically')
          // Let onend handle the restart to avoid race conditions
        } else if (event.error === 'audio-capture') {
          console.error('Audio capture error - microphone may be in use')
          alert('Microphone is not available. Please check if another application is using it.')
          recognitionRef.current = null
        }
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
        console.log('Speech recognition ended')
        
        // Only restart if the recognition was not manually stopped and enough time has passed
        if (recognitionRef.current === recognitionInstance) {
          const now = Date.now()
          const timeSinceLastRestart = now - lastRestartTime.current
          
          // Prevent rapid restarts - wait at least 3 seconds between restarts
          if (timeSinceLastRestart < 3000) {
            console.log('Skipping restart - too soon since last restart')
            return
          }
          
          console.log('Restarting speech recognition...')
          lastRestartTime.current = now
          
          setTimeout(() => {
            if (recognitionRef.current === recognitionInstance) {
              try {
                recognitionInstance.start()
              } catch (e) {
                console.log('Recognition restart failed:', e)
                recognitionRef.current = null
              }
            }
          }, 2000)
        }
      }

      // Store the instance in ref and state
      recognitionRef.current = recognitionInstance
      recognitionInstance.start()
      console.log('Speech recognition initialized successfully')
    } else {
      console.error('Speech recognition not supported in this browser')
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
      const isEdge = /Edg/.test(navigator.userAgent)
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
      
      if (!isChrome && !isEdge && !isSafari) {
        alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      } else {
        alert('Speech recognition is not available. Please check your browser settings and ensure you have microphone permissions.')
      }
    }
  }

  const toggleVideo = () => {
    if (videoStream) {
      const videoTrack = videoStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (videoStream) {
      const audioTrack = videoStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioOn(audioTrack.enabled)
      }
    }
  }

  const handleLeaveMeeting = () => {
    console.log('Leaving meeting:', id)
    navigate('/dashboard')
  }

  const handleScreenShare = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        })
        console.log('Screen sharing started')
        setShowScreenShareDialog(true)
        // You can add the screen stream to your video element or WebRTC connection here
        screenStream.getVideoTracks()[0].onended = () => {
          console.log('Screen sharing ended')
          setShowScreenShareDialog(false)
        }
      } else {
        setShowScreenShareDialog(true)
      }
    } catch (error: any) {
      console.error('Error starting screen share:', error)
      setShowScreenShareDialog(true)
    }
  }

  const handleInviteParticipants = () => {
    const meetingUrl = `${window.location.origin}/meeting/${id}`
    navigator.clipboard.writeText(meetingUrl).then(() => {
      setShowInviteDialog(true)
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = meetingUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShowInviteDialog(true)
    })
  }

  const handleSettings = () => {
    setShowSettingsDialog(true)
  }

  const participants = [
    { id: "1", name: user?.firstName + ' ' + user?.lastName || "You", avatar: user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.firstName || 'U')}&background=0f172a&color=fff`, status: "speaking" as const, role: "Host" },
  ]

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Meeting Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleLeaveMeeting}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="font-semibold">{currentMeeting?.title || "Meeting Room"}</h1>
              <p className="text-sm text-muted-foreground">
                Status: {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationSystem />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWhiteboard(true)}
            >
              <PenTool className="h-4 w-4 mr-2" />
              Whiteboard
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("annotations")}
            >
              <Presentation className="h-4 w-4 mr-2" />
              Annotate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("rooms")}
            >
              <Users className="h-4 w-4 mr-2" />
              Breakout
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCostCalculator(true)}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Cost
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col">
          {/* Video Grid */}
          <div className="flex-1 p-4 bg-slate-950">
            <div className="h-full rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 relative overflow-hidden">
              {/* Video feed or placeholder */}
              {videoStream && connectionStatus === 'connected' ? (
                <video
                  ref={(el) => {
                    setVideoRef(el)
                    if (el && videoStream) {
                      el.srcObject = videoStream
                    }
                  }}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {connectionStatus === 'connecting' ? 'Connecting to camera...' : 
                       connectionStatus === 'disconnected' ? 'Camera access denied' :
                       'Camera feed will appear here'}
                    </p>
                    <p className="text-sm text-slate-500 mt-2">
                      {connectionStatus === 'connecting' ? 'Please allow camera access' : 'WebRTC video streaming'}
                    </p>
                  </div>
                </div>
              )}

              {/* Participant video tiles */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                {participants.slice(0, 3).map((participant) => (
                  <div
                    key={participant.id}
                    className="w-32 h-24 rounded-lg bg-slate-800 border border-slate-600 flex items-center justify-center relative"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>{participant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <Badge
                      variant={participant.status === "speaking" ? "default" : "secondary"}
                      className="absolute -top-2 -right-2 text-xs"
                    >
                      {participant.status}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Live transcription overlay */}
              <div className="absolute bottom-4 left-4 right-40 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  <span className="text-sm font-medium">Live Transcription</span>
                  <span className="text-xs text-gray-400">
                    {isListening ? 'Listening...' : 'Not active'}
                  </span>
                </div>
                <div className="max-h-16 overflow-y-auto">
                  {transcript.length > 0 ? (
                    transcript.slice(-2).map((entry, index) => (
                      <p key={index} className="text-sm mb-1">
                        <span className="font-medium text-blue-400">{entry.speaker}:</span> {entry.text}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">
                      {isListening ? 'Start speaking to see transcription...' : 'Speech recognition not available'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Controls */}
          <div className="p-4 bg-slate-900/90 backdrop-blur-sm border-t border-slate-600 relative z-10">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant={isAudioOn ? "default" : "destructive"}
                size="lg"
                className="rounded-full w-14 h-14 bg-slate-700 hover:bg-slate-600 border-2 border-slate-500 text-white shadow-lg"
                onClick={toggleAudio}
                title={isAudioOn ? "Mute" : "Unmute"}
              >
                {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>
              
              <Button
                variant={isVideoOn ? "default" : "destructive"}
                size="lg"
                className="rounded-full w-14 h-14 bg-slate-700 hover:bg-slate-600 border-2 border-slate-500 text-white shadow-lg"
                onClick={toggleVideo}
                title={isVideoOn ? "Turn off camera" : "Turn on camera"}
              >
                {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full w-14 h-14 bg-slate-700 hover:bg-slate-600 border-2 border-slate-500 text-white shadow-lg"
                title="Share screen"
                onClick={handleScreenShare}
              >
                <Monitor className="h-6 w-6" />
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full w-14 h-14 bg-slate-700 hover:bg-slate-600 border-2 border-slate-500 text-white shadow-lg"
                title="Invite participants"
                onClick={handleInviteParticipants}
              >
                <UserPlus className="h-6 w-6" />
              </Button>

              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full w-14 h-14 bg-slate-700 hover:bg-slate-600 border-2 border-slate-500 text-white shadow-lg"
                title="Settings"
                onClick={handleSettings}
              >
                <Settings className="h-6 w-6" />
              </Button>

              <Button
                variant="destructive"
                size="lg"
                className="rounded-full w-14 h-14 ml-8 bg-red-600 hover:bg-red-700 border-2 border-red-500 text-white shadow-lg"
                onClick={handleLeaveMeeting}
                title="End call"
              >
                <Phone className="h-6 w-6 rotate-[135deg]" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 border-l border-border/50 bg-card/30 backdrop-blur-sm flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-5 m-4 mb-0 text-xs">
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="ai">AI</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="annotations">Notes</TabsTrigger>
              <TabsTrigger value="breakout">Rooms</TabsTrigger>
            </TabsList>

            <TabsContent value="team" className="flex-1 p-4 pt-2">
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Participants ({participants.length})</h3>
                    <Button variant="outline" size="sm">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">{participant.role}</p>
                      </div>
                      <Badge
                        variant={participant.status === "speaking" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {participant.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai" className="flex-1 p-4 pt-2">
              <AIInsightsPanel 
                isProcessing={isListening} 
                transcript={transcript}
                meetingDuration={Date.now() - (transcript[0]?.timestamp?.getTime() || Date.now())}
              />
            </TabsContent>

            <TabsContent value="chat" className="flex-1 p-4 pt-2">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Chat</h3>
                <p className="text-sm text-muted-foreground">Real-time chat will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="annotations" className="flex-1 p-4 pt-2">
              <ScreenAnnotation 
                user={user || undefined}
                onAnnotationCreate={(annotation) => {
                  // Send annotation to other participants via WebSocket
                  console.log('New annotation created:', annotation)
                  // TODO: Implement WebSocket broadcast
                }}
                onAnnotationUpdate={(annotations) => {
                  // Update annotation state for real-time sync
                  console.log('Annotations updated:', annotations)
                  // TODO: Sync with other participants
                }}
              />
            </TabsContent>

            <TabsContent value="breakout" className="flex-1 p-4 pt-2">
              <BreakoutRooms 
                participants={participants}
                user={user || undefined}
                onRoomCreate={(room) => {
                  // Handle new breakout room creation
                  console.log('New breakout room created:', room)
                  // TODO: Implement WebSocket broadcast for room creation
                }}
                onRoomJoin={(roomId, userId) => {
                  // Handle user joining a breakout room
                  console.log('User joining room:', { roomId, userId })
                  // TODO: Navigate to breakout room interface
                }}
                onRoomUpdate={(rooms) => {
                  // Handle room status updates
                  console.log('Breakout rooms updated:', rooms)
                  // TODO: Sync room states with other participants
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Virtual Whiteboard Modal */}
      <Dialog open={showWhiteboard} onOpenChange={setShowWhiteboard}>
        <DialogContent className="glass-strong max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Virtual Whiteboard</DialogTitle>
            <DialogDescription>
              Collaborate in real-time with drawing tools and AI suggestions
            </DialogDescription>
          </DialogHeader>
          <div className="h-[70vh] overflow-auto">
            <VirtualWhiteboard 
              participants={participants.map(p => ({
                id: p.id.toString(),
                name: p.name,
                avatar: p.avatar
              }))}
              user={user ? {
                firstName: user.firstName,
                lastName: user.lastName,
                id: user.id
              } : undefined}
              onCollaboratorUpdate={(collaborators) => console.log('Collaborators updated:', collaborators)}
              onWhiteboardSave={(data) => console.log('Whiteboard saved:', data)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Meeting Cost Calculator Modal */}
      <Dialog open={showCostCalculator} onOpenChange={setShowCostCalculator}>
        <DialogContent className="glass-strong max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Meeting Cost Analysis</DialogTitle>
            <DialogDescription>
              Real-time cost tracking and efficiency insights
            </DialogDescription>
          </DialogHeader>
          <div className="h-[70vh] overflow-auto">
            <MeetingCostCalculator 
              participants={participants.map(p => ({
                id: p.id.toString(),
                name: p.name,
                avatar: p.avatar,
                role: p.role
              }))}
              meetingDuration={Math.floor((Date.now() - startTime) / 60000) || 45}
              onCostUpdate={(cost, efficiency) => {
                setMeetingCost(cost)
                setCostEfficiency(efficiency)
              }}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Dialog Components */}
      {/* Invite Participants Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Invite Participants
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Share this meeting link with participants to join the meeting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-600">
              <p className="text-sm text-slate-300 mb-2">Meeting Link:</p>
              <p className="text-white font-mono text-sm break-all">
                {`${window.location.origin}/meeting/${id}`}
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm">Link copied to clipboard!</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowInviteDialog(false)} className="bg-primary hover:bg-primary/90">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Meeting Settings
            </DialogTitle>
            <DialogDescription className="text-slate-300">
              Configure your meeting preferences and options.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Audio Quality</h3>
                  <p className="text-sm text-slate-400">Adjust microphone and audio settings</p>
                </div>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Video Quality</h3>
                  <p className="text-sm text-slate-400">Camera resolution and frame rate</p>
                </div>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">AI Insights</h3>
                  <p className="text-sm text-slate-400">Real-time transcription and analysis</p>
                </div>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  Enabled
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">Recording</h3>
                  <p className="text-sm text-slate-400">Save meeting for later review</p>
                </div>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-800">
                  Start
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowSettingsDialog(false)} className="bg-primary hover:bg-primary/90">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Screen Share Dialog */}
      <Dialog open={showScreenShareDialog} onOpenChange={setShowScreenShareDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              Screen Sharing
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Monitor className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-white font-medium mb-2">Screen sharing active</h3>
              <p className="text-slate-300 text-sm">
                Your screen is now being shared with meeting participants.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowScreenShareDialog(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Continue Sharing
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setShowScreenShareDialog(false)}
              className="bg-red-600 hover:bg-red-700"
            >
              Stop Sharing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
