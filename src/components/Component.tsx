import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
// Import icons from the library
import { FaPencilAlt, FaEraser, FaTrash } from 'react-icons/fa';

// Establish connection to the Socket.IO server
const socket: Socket = io('http://localhost:3001');

// Define the structure of the data sent over sockets for type safety
interface DrawData {
  x: number;
  y: number;
  type: 'start' | 'draw' | 'stop';
  color: string;
  lineWidth: number;
}

const Whiteboard = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  // State for drawing tools
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);

  // Function to clear the canvas locally
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Handler to clear the canvas and notify other users
  const handleClearCanvas = () => {
    clearCanvas();
    socket.emit('clear');
  };

  // Main useEffect for setting up canvas and socket listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
      }
    }

    // Listener for drawing actions from other users
    const handleDrawEvent = (data: DrawData) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx) return;

      // Apply drawing settings from the event data
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (data.type === 'start') {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
      } else if (data.type === 'draw') {
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      } else {
        ctx.closePath();
      }
    };

    socket.on('draw', handleDrawEvent);
    socket.on('clear', clearCanvas);

    // Cleanup listeners when the component unmounts
    return () => {
      socket.off('draw', handleDrawEvent);
      socket.off('clear', clearCanvas);
    };
  }, []);

  // Effect to update context settings when tool changes
  useEffect(() => {
    if (context) {
      context.strokeStyle = tool === 'pen' ? color : '#f0f0f0'; // Use background color for eraser
      context.lineWidth = lineWidth;
    }
  }, [color, lineWidth, context, tool]);

  // --- Drawing Event Handlers ---

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    const { offsetX, offsetY } = event.nativeEvent;
    
    context.beginPath();
    context.moveTo(offsetX, offsetY);
    setIsDrawing(true);

    socket.emit('draw', {
      x: offsetX,
      y: offsetY,
      type: 'start',
      color: tool === 'pen' ? color : '#f0f0f0',
      lineWidth,
    });
  };

  const stopDrawing = () => {
    if (!context) return;
    context.closePath();
    setIsDrawing(false);
    socket.emit('draw', { type: 'stop' });
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    const { offsetX, offsetY } = event.nativeEvent;
    
    context.lineTo(offsetX, offsetY);
    context.stroke();

    socket.emit('draw', {
      x: offsetX,
      y: offsetY,
      type: 'draw',
      color: tool === 'pen' ? color : '#f0f0f0',
      lineWidth,
    });
  };

  return (
    <div>
      <div className="toolbar">
        <button
          className={`tool-button ${tool === 'pen' ? 'active' : ''}`}
          onClick={() => setTool('pen')}
          title="Pen"
        >
          <FaPencilAlt />
        </button>
        <button
          className={`tool-button ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool('eraser')}
          title="Eraser"
        >
          <FaEraser />
        </button>

        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          disabled={tool === 'eraser'}
          title="Color Picker"
        />
        <input
          type="range"
          min="1"
          max="50"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          title="Brush Size"
        />
        <button className="tool-button clear-button" onClick={handleClearCanvas} title="Clear All">
          <FaTrash />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default Whiteboard;