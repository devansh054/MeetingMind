"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Palette,
  Pen,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Type,
  Undo,
  Redo,
  Download,
  Share,
  Brain,
  Users,
  Trash2,
} from "lucide-react"

interface DrawingTool {
  type: "pen" | "eraser" | "rectangle" | "circle" | "arrow" | "text"
  color: string
  size: number
}

interface Collaborator {
  id: string
  name: string
  color: string
  cursor: { x: number; y: number } | null
}

interface VirtualWhiteboardProps {
  participants?: { id: string; name: string; avatar?: string }[]
  user?: { firstName?: string; lastName?: string; id?: string }
  onCollaboratorUpdate?: (collaborators: Collaborator[]) => void
  onWhiteboardSave?: (data: string) => void
}

export default function VirtualWhiteboard({ participants = [], user, onCollaboratorUpdate, onWhiteboardSave }: VirtualWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<DrawingTool>({
    type: "pen",
    color: "#00bcd4",
    size: 3,
  })
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false)
  const [undoStack, setUndoStack] = useState<ImageData[]>([])
  const [redoStack, setRedoStack] = useState<ImageData[]>([])

  const colors = ["#00bcd4", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff"]
  const sizes = [1, 3, 5, 8, 12]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set default styles
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    saveCanvasState() // Save state before drawing
    setIsDrawing(true)
    setRedoStack([]) // Clear redo stack when new action starts
    
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.globalCompositeOperation = currentTool.type === "eraser" ? "destination-out" : "source-over"
    ctx.strokeStyle = currentTool.color
    ctx.lineWidth = currentTool.size

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const saveCanvasState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setUndoStack(prev => [...prev.slice(-9), imageData]) // Keep last 10 states
  }

  const undo = () => {
    if (undoStack.length === 0) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setRedoStack(prev => [...prev, currentState])
    
    const previousState = undoStack[undoStack.length - 1]
    ctx.putImageData(previousState, 0, 0)
    setUndoStack(prev => prev.slice(0, -1))
  }

  const redo = () => {
    if (redoStack.length === 0) return
    
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setUndoStack(prev => [...prev, currentState])
    
    const nextState = redoStack[redoStack.length - 1]
    ctx.putImageData(nextState, 0, 0)
    setRedoStack(prev => prev.slice(0, -1))
  }

  const analyzeWithAI = () => {
    setIsAIAnalyzing(true)
    
    // Simulate AI analysis based on canvas content
    setTimeout(() => {
      const suggestions = [
        "Convert hand-drawn shapes to perfect geometry",
        "Organize scattered elements into structured layout",
        "Add labels and annotations to improve clarity",
        "Create color-coded sections for better organization"
      ]
      
      setAiSuggestions(suggestions.slice(0, Math.floor(Math.random() * 3) + 1))
      setIsAIAnalyzing(false)
    }, 1500)
  }

  const exportWhiteboard = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL('image/png')
    onWhiteboardSave?.(dataURL)
    
    const link = document.createElement("a")
    link.download = `whiteboard-${new Date().toISOString().split('T')[0]}.png`
    link.href = dataURL
    link.click()
  }

  const shareWhiteboard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.toBlob((blob) => {
      if (blob && navigator.share) {
        const file = new File([blob], 'whiteboard.png', { type: 'image/png' })
        navigator.share({
          title: 'Meeting Whiteboard',
          text: 'Check out our collaborative whiteboard from the meeting',
          files: [file]
        }).catch(console.error)
      } else {
        // Fallback: copy to clipboard
        canvas.toBlob((blob) => {
          if (blob) {
            navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]).then(() => {
              console.log('Whiteboard copied to clipboard')
            }).catch(console.error)
          }
        })
      }
    })
  }

  return (
    <Card className="glass h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Virtual Whiteboard
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              {collaborators.length + 1} Active
            </Badge>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-transparent" 
              onClick={analyzeWithAI}
              disabled={isAIAnalyzing}
            >
              <Brain className="h-3 w-3 mr-1" />
              {isAIAnalyzing ? 'Analyzing...' : 'AI Analyze'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drawing Tools */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {[
              { type: "pen" as const, icon: Pen },
              { type: "eraser" as const, icon: Eraser },
              { type: "rectangle" as const, icon: Square },
              { type: "circle" as const, icon: Circle },
              { type: "arrow" as const, icon: ArrowRight },
              { type: "text" as const, icon: Type },
            ].map(({ type, icon: Icon }) => (
              <Button
                key={type}
                variant={currentTool.type === type ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0 bg-transparent"
                onClick={() => setCurrentTool((prev) => ({ ...prev, type }))}
              >
                <Icon className="h-3 w-3" />
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Colors */}
          <div className="flex items-center gap-1">
            {colors.map((color) => (
              <button
                key={color}
                className={`h-6 w-6 rounded-full border-2 ${
                  currentTool.color === color ? "border-white" : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentTool((prev) => ({ ...prev, color }))}
              />
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Sizes */}
          <div className="flex items-center gap-1">
            {sizes.map((size) => (
              <Button
                key={size}
                variant={currentTool.size === size ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0 bg-transparent text-xs"
                onClick={() => setCurrentTool((prev) => ({ ...prev, size }))}
              >
                {size}
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 bg-transparent" 
              onClick={undo}
              disabled={undoStack.length === 0}
            >
              <Undo className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 w-8 p-0 bg-transparent" 
              onClick={redo}
              disabled={redoStack.length === 0}
            >
              <Redo className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent" onClick={clearCanvas}>
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent" onClick={exportWhiteboard}>
              <Download className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-transparent" onClick={shareWhiteboard}>
              <Share className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="relative border border-border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            className="w-full h-80 cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          {/* Collaborator Cursors */}
          {collaborators.map(
            (collaborator) =>
              collaborator.cursor && (
                <div
                  key={collaborator.id}
                  className="absolute pointer-events-none"
                  style={{
                    left: collaborator.cursor.x,
                    top: collaborator.cursor.y,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: collaborator.color }}
                  />
                  <div
                    className="text-xs font-medium px-1 py-0.5 rounded mt-1 text-white"
                    style={{ backgroundColor: collaborator.color }}
                  >
                    {collaborator.name}
                  </div>
                </div>
              ),
          )}
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && (
          <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Brain className="h-3 w-3 text-primary" />
              AI Suggestions
            </div>
            <div className="space-y-1">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{suggestion}</span>
                  <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent">
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Collaborators */}
        <div className="flex items-center gap-2">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Active:</span>
          {collaborators.map((collaborator) => (
            <div key={collaborator.id} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: collaborator.color }} />
              <span className="text-xs">{collaborator.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
