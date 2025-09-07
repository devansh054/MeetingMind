import React, { useRef, useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PenTool, 
  Eraser, 
  Square, 
  Circle, 
  Type,
  Palette,
  Download,
  Trash2,
  Undo,
  Redo,
  Users
} from "lucide-react";

interface VirtualWhiteboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VirtualWhiteboardModal: React.FC<VirtualWhiteboardModalProps> = ({
  isOpen,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen');
  const [color, setColor] = useState('#3B82F6');
  const [brushSize, setBrushSize] = useState(3);
  const [collaborators] = useState(['You', 'Alice', 'Bob']);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
  }, [isOpen, color, brushSize]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 2;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#000000'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[98vw] !h-[98vh] !max-w-none !max-h-none overflow-hidden glass-strong border border-white/20">
        <DialogHeader className="pb-4 border-b border-white/20">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            Virtual Whiteboard
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-auto">
              <Users className="h-3 w-3 mr-1" />
              {collaborators.length} Active
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full pt-4">
          {/* Toolbar */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
            {/* Drawing Tools */}
            <div className="flex items-center gap-2">
              <Button
                variant={tool === 'pen' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('pen')}
                className={tool === 'pen' ? 'bg-primary' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}
              >
                <PenTool className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === 'eraser' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('eraser')}
                className={tool === 'eraser' ? 'bg-primary' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}
              >
                <Eraser className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === 'rectangle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('rectangle')}
                className={tool === 'rectangle' ? 'bg-primary' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === 'circle' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('circle')}
                className={tool === 'circle' ? 'bg-primary' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}
              >
                <Circle className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('text')}
                className={tool === 'text' ? 'bg-primary' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}
              >
                <Type className="h-4 w-4" />
              </Button>
            </div>

            {/* Color Palette */}
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-white/60" />
              {colors.map((c) => (
                <button
                  key={c}
                  className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white' : 'border-white/30'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>

            {/* Brush Size */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-white w-6">{brushSize}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadCanvas}
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-white rounded-lg border border-white/20 overflow-hidden">
            <canvas
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>

          {/* Collaborators */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Collaborators:</span>
              {collaborators.map((name, index) => (
                <Badge key={index} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {name}
                </Badge>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Close
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Save & Share
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualWhiteboardModal;
