import { useRef, useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Pencil, Eraser, RotateCcw, Save, X } from "lucide-react";

interface DrawingCanvasProps {
  initialImage?: string;
  onSave: (imageData: string) => void;
  onCancel: () => void;
}

export function DrawingCanvas({ initialImage, onSave, onCancel }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");
  
  // Set up canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext("2d");
    if (!context) return;
    
    // Set canvas size to match container
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set default stroke style
    context.strokeStyle = "#000000";
    context.lineWidth = 2;
    context.lineCap = "round";
    
    setCtx(context);
    
    // Load initial image if provided
    if (initialImage) {
      const img = new Image();
      img.onload = () => {
        context.drawImage(img, 0, 0);
      };
      img.src = initialImage;
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!canvas || !context) return;
      
      // Save current drawing
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx?.drawImage(canvas, 0, 0);
      
      // Resize canvas
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Restore drawing
      context.drawImage(tempCanvas, 0, 0);
      
      // Reset context settings after resize
      context.strokeStyle = tool === "pencil" ? "#000000" : "#ffffff";
      context.lineWidth = tool === "pencil" ? 2 : 20;
      context.lineCap = "round";
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initialImage]);
  
  // Update tool settings when tool changes
  useEffect(() => {
    if (!ctx) return;
    
    if (tool === "pencil") {
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
    } else {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 20;
    }
  }, [tool, ctx]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    
    setIsDrawing(true);
    
    // Get coordinates
    let x, y;
    if ('touches' in e) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    // Get coordinates
    let x, y;
    if ('touches' in e) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    if (!ctx) return;
    setIsDrawing(false);
    ctx.closePath();
  };
  
  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };
  
  const handleSave = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onSave(dataUrl);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-2">
          <Button
            type="button"
            onClick={() => setTool("pencil")}
            variant={tool === "pencil" ? "default" : "outline"}
            size="sm"
            className="p-2"
            title="Pencil"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={() => setTool("eraser")}
            variant={tool === "eraser" ? "default" : "outline"}
            size="sm"
            className="p-2"
            title="Eraser"
          >
            <Eraser className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            onClick={clearCanvas}
            variant="outline"
            size="sm"
            className="p-2"
            title="Clear Canvas"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="border rounded border-gray-300" style={{ height: "300px" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button onClick={handleSave} size="sm">
          <Save className="h-4 w-4 mr-2" />
          Save Drawing
        </Button>
        <Button onClick={onCancel} variant="outline" size="sm">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
} 