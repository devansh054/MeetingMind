"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Download, Copy, Bookmark, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

interface TranscriptEntry {
  id: number
  speaker: string
  text: string
  timestamp: string
  confidence: number
  sentiment: "positive" | "neutral" | "negative"
  isActionItem?: boolean
  isKeyPoint?: boolean
}

export default function EnhancedTranscript() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "actions" | "keypoints">("all")

  const transcriptEntries: TranscriptEntry[] = [
    {
      id: 1,
      speaker: "Sarah Chen",
      text: "Welcome everyone to our quarterly business review. Today we'll be discussing our Q4 performance metrics, upcoming product launches, and strategic planning for 2024.",
      timestamp: "00:00:15",
      confidence: 98,
      sentiment: "positive",
      isKeyPoint: true,
    },
    {
      id: 2,
      speaker: "Marcus Johnson",
      text: "Thanks Sarah. I'm excited to share that we've exceeded our revenue targets by 23% this quarter. The metrics show strong growth across all product lines.",
      timestamp: "00:01:32",
      confidence: 96,
      sentiment: "positive",
      isKeyPoint: true,
    },
    {
      id: 3,
      speaker: "Elena Rodriguez",
      text: "That's fantastic news! The design team has been working closely with product to ensure our new features align with user feedback. We should schedule a follow-up meeting to discuss the roadmap.",
      timestamp: "00:02:45",
      confidence: 94,
      sentiment: "positive",
      isActionItem: true,
    },
    {
      id: 4,
      speaker: "David Kim",
      text: "I agree with Elena. From an engineering perspective, we'll need to review our resource allocation for Q1 to support the new initiatives Marcus mentioned.",
      timestamp: "00:03:58",
      confidence: 92,
      sentiment: "neutral",
      isActionItem: true,
    },
    {
      id: 5,
      speaker: "Sarah Chen",
      text: "Excellent points everyone. Let me make sure we capture these action items. Marcus, can you prepare the detailed budget analysis by next Friday?",
      timestamp: "00:05:12",
      confidence: 97,
      sentiment: "positive",
      isActionItem: true,
    },
  ]

  const filteredEntries = transcriptEntries.filter((entry) => {
    const matchesSearch =
      entry.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.speaker.toLowerCase().includes(searchQuery.toLowerCase())

    if (filter === "actions") return matchesSearch && entry.isActionItem
    if (filter === "keypoints") return matchesSearch && entry.isKeyPoint
    return matchesSearch
  })

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-400"
      case "negative":
        return "text-red-400"
      default:
        return "text-yellow-400"
    }
  }

  return (
    <div className="space-y-4">
      {/* Transcript Controls */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transcript..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm" className="bg-transparent">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={filter !== "all" ? "bg-transparent" : ""}
        >
          All
        </Button>
        <Button
          variant={filter === "actions" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("actions")}
          className={filter !== "actions" ? "bg-transparent" : ""}
        >
          Action Items
        </Button>
        <Button
          variant={filter === "keypoints" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("keypoints")}
          className={filter !== "keypoints" ? "bg-transparent" : ""}
        >
          Key Points
        </Button>
      </div>

      {/* Transcript Entries */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="glass p-4 hover:glass-strong transition-all">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={`/professional-${entry.speaker.includes("Sarah") || entry.speaker.includes("Elena") ? "woman" : "man"}.png`}
                  />
                  <AvatarFallback>
                    {entry.speaker
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{entry.speaker}</span>
                    <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                    <div className={`h-1 w-1 rounded-full ${getSentimentColor(entry.sentiment)}`} />
                    <span className="text-xs text-muted-foreground">{entry.confidence}%</span>

                    {entry.isActionItem && (
                      <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                        Action
                      </Badge>
                    )}
                    {entry.isKeyPoint && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      >
                        Key Point
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-foreground/90 leading-relaxed">{entry.text}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Bookmark className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Export Options */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Download className="h-4 w-4 mr-1" />
          Export Transcript
        </Button>
        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
          <Copy className="h-4 w-4 mr-1" />
          Copy All
        </Button>
      </div>
    </div>
  )
}
