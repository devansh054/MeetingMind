"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Monitor,
  Pen,
  Square,
  Circle,
  ArrowRight,
  Type,
  Highlighter,
  MousePointer,
  Save,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react"

interface AnnotationTool {
  type: "pen" | "rectangle" | "circle" | "arrow" | "text" | "highlight" | "pointer"
  color: string
  size: number
}

interface Annotation {
  id: string
  type: string
  x: number
  y: number
  width?: number
  height?: number
  text?: string
  color: string
  size: number
  timestamp: Date
  author: string
  path?: { x: number; y: number }[]
}

interface ScreenAnnotationProps {
  user?: { firstName?: string; lastName?: string }
  onAnnotationCreate?: (annotation: Annotation) => void
  onAnnotationUpdate?: (annotations: Annotation[]) => void
}

export default function ScreenAnnotation({ user, onAnnotationCreate, onAnnotationUpdate }: ScreenAnnotationProps) {
  const [isAnnotating, setIsAnnotating] = useState(false)
  const [currentTool, setCurrentTool] = useState<AnnotationTool>({
    type: "pen",
    color: "#ff6b6b",
    size: 3,
  })
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [opacity, setOpacity] = useState([80])
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#feca57", "#ff9ff3", "#54a0ff"]

  const toggleAnnotationMode = () => {
    setIsAnnotating(!isAnnotating)
    if (!isAnnotating) {
      // Enable annotation mode - could trigger screen capture here
      console.log('Starting annotation mode')
    } else {
      // Disable annotation mode
      setIsDrawing(false)
      setCurrentPath([])
      console.log('Stopping annotation mode')
    }
  }

  const clearAllAnnotations = () => {
    setAnnotations([])
    onAnnotationUpdate?.([])
    // Clear canvas if exists
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const saveAnnotations = () => {
    // Save annotations to meeting notes
    const annotationData = {
      annotations,
      timestamp: new Date(),
      meetingId: window.location.pathname.split('/').pop(),
      totalAnnotations: annotations.length
    }
    console.log('Saving annotations to meeting notes:', annotationData)
    // TODO: Integrate with backend API to save annotations
  }

  const removeAnnotation = (annotationId: string) => {
    const updatedAnnotations = annotations.filter(ann => ann.id !== annotationId)
    setAnnotations(updatedAnnotations)
    onAnnotationUpdate?.(updatedAnnotations)
  }

  const createAnnotation = useCallback((type: string, x: number, y: number, additionalProps: Partial<Annotation> = {}) => {
    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type,
      x,
      y,
      color: currentTool.color,
      size: currentTool.size,
      timestamp: new Date(),
      author: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'You' : 'You',
      ...additionalProps
    }
    
    const updatedAnnotations = [...annotations, newAnnotation]
    setAnnotations(updatedAnnotations)
    onAnnotationCreate?.(newAnnotation)
    onAnnotationUpdate?.(updatedAnnotations)
    
    return newAnnotation
  }, [annotations, currentTool, user, onAnnotationCreate, onAnnotationUpdate])

  // Handle mouse events for drawing
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnnotating) return
    
    setIsDrawing(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (currentTool.type === 'pen') {
      setCurrentPath([{ x, y }])
    } else {
      // For shapes, start creating annotation
      createAnnotation(currentTool.type, x, y)
    }
  }, [isAnnotating, currentTool.type, createAnnotation])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAnnotating || !isDrawing) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (currentTool.type === 'pen') {
      setCurrentPath(prev => [...prev, { x, y }])
    }
  }, [isAnnotating, isDrawing, currentTool.type])

  const handleMouseUp = useCallback(() => {
    if (!isAnnotating || !isDrawing) return
    
    setIsDrawing(false)
    
    if (currentTool.type === 'pen' && currentPath.length > 0) {
      createAnnotation('pen', currentPath[0].x, currentPath[0].y, { path: currentPath })
      setCurrentPath([])
    }
  }, [isAnnotating, isDrawing, currentTool.type, currentPath, createAnnotation])

  return (
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" />
            Screen Annotation
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              variant={isAnnotating ? "default" : "secondary"}
              className={isAnnotating ? "bg-red-500 text-white animate-pulse" : "bg-slate-600 text-white"}
            >
              {isAnnotating ? "Annotating" : "Ready"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Annotation Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              variant={isAnnotating ? "destructive" : "default"}
              size="sm"
              onClick={toggleAnnotationMode}
              className="flex-1"
            >
              {isAnnotating ? "Stop Annotating" : "Start Annotating"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent"
              onClick={() => setShowAnnotations(!showAnnotations)}
            >
              {showAnnotations ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>

          {/* Tools */}
          {isAnnotating && (
            <div className="space-y-3 p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-1 flex-wrap">
                {[
                  { type: "pen" as const, icon: Pen },
                  { type: "rectangle" as const, icon: Square },
                  { type: "circle" as const, icon: Circle },
                  { type: "arrow" as const, icon: ArrowRight },
                  { type: "text" as const, icon: Type },
                  { type: "highlight" as const, icon: Highlighter },
                  { type: "pointer" as const, icon: MousePointer },
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

              {/* Colors */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Color:</span>
                <div className="flex items-center gap-1">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`h-5 w-5 rounded-full border-2 ${
                        currentTool.color === color ? "border-white" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCurrentTool((prev) => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Size:</span>
                  <span className="text-xs">{currentTool.size}px</span>
                </div>
                <Slider
                  value={[currentTool.size]}
                  onValueChange={(value) => setCurrentTool((prev) => ({ ...prev, size: value[0] }))}
                  max={20}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Opacity:</span>
                  <span className="text-xs">{opacity[0]}%</span>
                </div>
                <Slider value={opacity} onValueChange={setOpacity} max={100} min={10} step={10} className="w-full" />
              </div>
            </div>
          )}
        </div>

        {/* Active Annotations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Active Annotations ({annotations.length})</h4>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent" onClick={saveAnnotations}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm" className="h-6 text-xs bg-transparent" onClick={clearAllAnnotations}>
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
          </div>

          {annotations.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {annotations.map((annotation) => (
                <div key={annotation.id} className="flex items-center gap-3 p-2 bg-muted/10 rounded text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: annotation.color }} />
                  <div className="flex-1">
                    <div className="font-medium">
                      {annotation.type} by {annotation.author}
                    </div>
                    <div className="text-muted-foreground">
                      {new Date(annotation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-5 w-5 p-0 bg-transparent"
                    onClick={() => removeAnnotation(annotation.id)}
                  >
                    <Trash2 className="h-2 w-2" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              No annotations yet. Start annotating to mark up the shared screen.
            </p>
          )}
        </div>

        {/* Drawing Canvas Overlay */}
        {isAnnotating && (
          <div 
            className="fixed inset-0 z-50 cursor-crosshair"
            style={{ pointerEvents: isAnnotating ? 'auto' : 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ opacity: opacity[0] / 100 }}
            />
            {/* Annotation toolbar overlay */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded-lg p-2 flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[
                  { type: "pen" as const, icon: Pen },
                  { type: "rectangle" as const, icon: Square },
                  { type: "circle" as const, icon: Circle },
                  { type: "arrow" as const, icon: ArrowRight },
                ].map(({ type, icon: Icon }) => (
                  <Button
                    key={type}
                    variant={currentTool.type === type ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentTool((prev) => ({ ...prev, type }))}
                  >
                    <Icon className="h-3 w-3" />
                  </Button>
                ))}
              </div>
              <div className="w-px h-6 bg-slate-600" />
              <div className="flex items-center gap-1">
                {colors.slice(0, 4).map((color) => (
                  <button
                    key={color}
                    className={`h-6 w-6 rounded-full border-2 ${
                      currentTool.color === color ? "border-white" : "border-slate-600"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setCurrentTool((prev) => ({ ...prev, color }))}
                  />
                ))}
              </div>
              <div className="w-px h-6 bg-slate-600" />
              <Button
                variant="destructive"
                size="sm"
                onClick={toggleAnnotationMode}
                className="text-xs"
              >
                Stop
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-2 p-3 bg-muted/20 rounded-lg">
          <div className="text-sm font-medium">How to use:</div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Click "Start Annotating" to begin marking up the screen</li>
            <li>• Select tools and colors to highlight important areas</li>
            <li>• Annotations are visible to all participants in real-time</li>
            <li>• Save annotations to include them in meeting notes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
