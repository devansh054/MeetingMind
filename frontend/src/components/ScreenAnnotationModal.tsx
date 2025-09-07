import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Presentation, 
  PenTool, 
  Square, 
  Circle, 
  ArrowRight,
  Type,
  Highlighter,
  MousePointer,
  Monitor,
  Share2
} from "lucide-react";

interface ScreenAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScreenAnnotationModal: React.FC<ScreenAnnotationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [tool, setTool] = useState<'pointer' | 'pen' | 'highlighter' | 'arrow' | 'rectangle' | 'circle' | 'text'>('pointer');
  const [color, setColor] = useState('#EF4444');
  const [isAnnotating, setIsAnnotating] = useState(false);

  const startAnnotation = () => {
    setIsAnnotating(true);
    // In a real implementation, this would start screen capture
  };

  const stopAnnotation = () => {
    setIsAnnotating(false);
  };

  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#FFFFFF'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[98vw] !h-[98vh] !max-w-none !max-h-none overflow-hidden glass-strong border border-white/20">
        <DialogHeader className="pb-4 border-b border-white/20">
          <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
            <Presentation className="h-5 w-5 text-primary" />
            Screen Annotation
            {isAnnotating && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 ml-auto animate-pulse">
                Recording
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full pt-4">
          {/* Toolbar */}
          <div className="flex items-center gap-4 mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
            {/* Annotation Tools */}
            <div className="flex items-center gap-2">
              <Button
                variant={tool === 'pointer' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('pointer')}
                className={tool === 'pointer' ? 'bg-primary' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}
              >
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === 'pen' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('pen')}
                className={tool === 'pen' ? 'bg-primary' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}
              >
                <PenTool className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === 'highlighter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('highlighter')}
                className={tool === 'highlighter' ? 'bg-primary' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
              <Button
                variant={tool === 'arrow' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTool('arrow')}
                className={tool === 'arrow' ? 'bg-primary' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}
              >
                <ArrowRight className="h-4 w-4" />
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
              {colors.map((c) => (
                <button
                  key={c}
                  className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white' : 'border-white/30'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>

            {/* Screen Control */}
            <div className="flex items-center gap-2 ml-auto">
              {!isAnnotating ? (
                <Button
                  onClick={startAnnotation}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Start Screen Annotation
                </Button>
              ) : (
                <Button
                  onClick={stopAnnotation}
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Stop Annotation
                </Button>
              )}
            </div>
          </div>

          {/* Screen Preview/Annotation Area */}
          <div className="flex-1 bg-gray-900 rounded-lg border border-white/20 overflow-hidden relative">
            {!isAnnotating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Monitor className="h-16 w-16 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Ready to Annotate</h3>
                  <p className="text-white/60 mb-4">Click "Start Screen Annotation" to begin marking up your screen in real-time</p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-2">
                      <PenTool className="h-4 w-4" />
                      Draw & highlight
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      Point & direct
                    </div>
                    <div className="flex items-center gap-2">
                      <Square className="h-4 w-4" />
                      Add shapes
                    </div>
                    <div className="flex items-center gap-2">
                      <Type className="h-4 w-4" />
                      Insert text
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-pulse">
                    <Monitor className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Screen Annotation Active</h3>
                  <p className="text-white/60 mb-4">Your screen is being captured. Use the tools above to annotate in real-time.</p>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    Live Annotation Mode
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Features Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="text-center">
              <Share2 className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-white text-sm">Real-time Sharing</h4>
              <p className="text-xs text-white/60">Annotations visible to all participants instantly</p>
            </div>
            <div className="text-center">
              <PenTool className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-white text-sm">Multiple Tools</h4>
              <p className="text-xs text-white/60">Pen, highlighter, shapes, arrows, and text</p>
            </div>
            <div className="text-center">
              <Monitor className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-white text-sm">Screen Capture</h4>
              <p className="text-xs text-white/60">Annotate any application or presentation</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              Close
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                Save Annotations
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                Share Screen
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScreenAnnotationModal;
