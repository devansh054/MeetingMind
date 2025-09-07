"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Download,
  Heart,
  ThumbsUp,
  Laugh,
  FileText,
  ImageIcon,
  Upload,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Message {
  id: number
  user: string
  message: string
  time: string
  type: "text" | "file" | "image"
  fileUrl?: string
  fileName?: string
  fileSize?: string
  reactions?: { emoji: string; users: string[]; count: number }[]
  isUploading?: boolean
  uploadProgress?: number
}

interface TypingUser {
  name: string
  avatar: string
}

export default function RealTimeChat() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      user: "Sarah Chen",
      message: "Welcome everyone! Let's start with the quarterly review.",
      time: "2:30 PM",
      type: "text",
      reactions: [{ emoji: "👍", users: ["Marcus Johnson", "Elena Rodriguez"], count: 2 }],
    },
    {
      id: 2,
      user: "Marcus Johnson",
      message: "Thanks Sarah. I have the metrics ready to share.",
      time: "2:31 PM",
      type: "text",
    },
    {
      id: 3,
      user: "Elena Rodriguez",
      message: "Perfect timing! Looking forward to the insights.",
      time: "2:32 PM",
      type: "text",
    },
    {
      id: 4,
      user: "Marcus Johnson",
      message: "Q4_Performance_Report.pdf",
      time: "2:33 PM",
      type: "file",
      fileName: "Q4_Performance_Report.pdf",
      fileSize: "2.4 MB",
      fileUrl: "/documents/q4-report.pdf",
    },
  ])
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      const shouldShowTyping = Math.random() > 0.7
      if (shouldShowTyping && typingUsers.length === 0) {
        setTypingUsers([{ name: "David Kim", avatar: "/professional-man.png" }])
        setTimeout(() => setTypingUsers([]), 3000)
      }
    }, 8000)

    return () => clearInterval(interval)
  }, [typingUsers])

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        user: "You",
        message: message.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "text",
      }
      setMessages([...messages, newMessage])
      setMessage("")

      toast({
        title: "Message sent",
        description: "Your message has been delivered to all participants",
      })
    }
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach((file) => {
      const newMessage: Message = {
        id: messages.length + Math.random(),
        user: "You",
        message: file.name,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: file.type.startsWith("image/") ? "image" : "file",
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        isUploading: true,
        uploadProgress: 0,
      }

      setMessages((prev) => [...prev, newMessage])

      // Simulate file upload progress
      const uploadInterval = setInterval(() => {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === newMessage.id && msg.isUploading) {
              const newProgress = (msg.uploadProgress || 0) + 10
              if (newProgress >= 100) {
                clearInterval(uploadInterval)
                return { ...msg, isUploading: false, uploadProgress: 100 }
              }
              return { ...msg, uploadProgress: newProgress }
            }
            return msg
          }),
        )
      }, 200)

      toast({
        title: "File uploading",
        description: `Uploading ${file.name}...`,
      })
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const addReaction = (messageId: number, emoji: string) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions?.find((r) => r.emoji === emoji)
          if (existingReaction) {
            // Toggle reaction
            const hasUserReacted = existingReaction.users.includes("You")
            if (hasUserReacted) {
              return {
                ...msg,
                reactions: msg.reactions
                  ?.map((r) =>
                    r.emoji === emoji ? { ...r, users: r.users.filter((u) => u !== "You"), count: r.count - 1 } : r,
                  )
                  .filter((r) => r.count > 0),
              }
            } else {
              return {
                ...msg,
                reactions: msg.reactions?.map((r) =>
                  r.emoji === emoji ? { ...r, users: [...r.users, "You"], count: r.count + 1 } : r,
                ),
              }
            }
          } else {
            // Add new reaction
            return {
              ...msg,
              reactions: [...(msg.reactions || []), { emoji, users: ["You"], count: 1 }],
            }
          }
        }
        return msg
      }),
    )

    toast({
      title: "Reaction added",
      description: `You reacted with ${emoji}`,
    })
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "file":
        return <FileText className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/20 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-50">
          <div className="text-center">
            <Upload className="h-12 w-12 text-primary mx-auto mb-2" />
            <p className="text-lg font-medium text-primary">Drop files to share</p>
            <p className="text-sm text-muted-foreground">Images, documents, and more</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="group">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      msg.user === "You"
                        ? "/user-avatar.jpg"
                        : `/professional-${msg.user.includes("Sarah") || msg.user.includes("Elena") ? "woman" : "man"}.png`
                    }
                  />
                  <AvatarFallback>
                    {msg.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{msg.user}</span>
                    <span className="text-xs text-muted-foreground">{msg.time}</span>
                    {msg.user === "You" && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>

                  {msg.type === "text" ? (
                    <div className="bg-accent/10 rounded-lg p-3 max-w-md">
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ) : (
                    <div className="bg-accent/10 rounded-lg p-3 max-w-md">
                      <div className="flex items-center gap-2 mb-2">
                        {getMessageIcon(msg.type)}
                        <span className="text-sm font-medium">{msg.fileName}</span>
                      </div>
                      {msg.isUploading ? (
                        <div className="space-y-2">
                          <Progress value={msg.uploadProgress} className="h-2" />
                          <p className="text-xs text-muted-foreground">Uploading... {msg.uploadProgress}%</p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{msg.fileSize}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {msg.reactions.map((reaction, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs bg-accent/20 hover:bg-accent/30"
                          onClick={() => addReaction(msg.id, reaction.emoji)}
                        >
                          {reaction.emoji} {reaction.count}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Message actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-strong">
                      <DropdownMenuItem onClick={() => addReaction(msg.id, "👍")}>
                        <ThumbsUp className="h-4 w-4 mr-2" />👍 Thumbs up
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addReaction(msg.id, "❤️")}>
                        <Heart className="h-4 w-4 mr-2" />
                        ❤️ Heart
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addReaction(msg.id, "😂")}>
                        <Laugh className="h-4 w-4 mr-2" />😂 Laugh
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}

          {/* Typing indicators */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={typingUsers[0].avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {typingUsers[0].name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="bg-accent/10 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">{typingUsers[0].name} is typing</span>
                  <div className="flex gap-1">
                    <div className="h-1 w-1 bg-primary rounded-full animate-bounce" />
                    <div className="h-1 w-1 bg-primary rounded-full animate-bounce delay-75" />
                    <div className="h-1 w-1 bg-primary rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />
          <Button variant="outline" size="sm" className="bg-transparent" onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button variant="outline" size="sm" className="bg-transparent">
            <Smile className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
