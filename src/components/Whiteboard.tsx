import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { FaPencilAlt, FaEraser, FaTrash, FaStickyNote, FaUndo, FaRedo, FaRegSquare, FaRegCircle } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import StickyNote, {type Note } from './StickyNote';
import LiveCursor from './LiveCursor';
import UserAvatar from './UserAvatar';


// --- THIS IS THE CRITICAL CHANGE ---
// We now connect to a specific URL. You will replace this with your live backend URL from Render.
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001 || https://whiteboard-backend-0fmu.onrender.com/';
const socket: Socket = io(VITE_BACKEND_URL);


interface CursorData {
  x: number;
  y: number;
  username: string;
}

interface User {
  id: string;
  username: string;
}

const CANVAS_BACKGROUND_COLOR = '#171717';

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle';

const PRESET_COLORS = [
  '#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#AF52DE'
];

const Whiteboard = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#FFFFFF');
  const [lineWidth, setLineWidth] = useState(5);

  const drawingStartPoint = useRef<{ x: number, y: number } | null>(null);
  const canvasSnapshot = useRef<string | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [cursors, setCursors] = useState<{ [id: string]: CursorData }>({});
  const [historyState, setHistoryState] = useState<{ stack: string[], index: number }>({ stack: [], index: -1 });
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState('Anonymous');
  
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false);

  const redrawCanvasFromDataUrl = (dataUrl: string) => {
    const canvas = canvasRef.current;
    const ctx = context;
    if (!canvas || !ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = dataUrl;
  };

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setHistoryState(prevState => {
      const newStack = prevState.stack.slice(0, prevState.index + 1);
      newStack.push(dataUrl);
      return { stack: newStack, index: newStack.length - 1 };
    });
    socket.emit('canvas-state-update', dataUrl);
  };

  const handleUndo = () => {
    setHistoryState(prevState => {
      if (prevState.index > 0) {
        const newIndex = prevState.index - 1;
        const dataUrl = prevState.stack[newIndex];
        redrawCanvasFromDataUrl(dataUrl);
        socket.emit('canvas-state-update', dataUrl);
        return { ...prevState, index: newIndex };
      }
      return prevState;
    });
  };

  const handleRedo = () => {
    setHistoryState(prevState => {
      if (prevState.index < prevState.stack.length - 1) {
        const newIndex = prevState.index + 1;
        const dataUrl = prevState.stack[newIndex];
        redrawCanvasFromDataUrl(dataUrl);
        socket.emit('canvas-state-update', dataUrl);
        return { ...prevState, index: newIndex };
      }
      return prevState;
    });
  };
  
  const addNote = () => {
    const newNote: Note = { id: crypto.randomUUID(), text: '', position: { x: 100, y: 100 } };
    setNotes(prev => [...prev, newNote]);
    socket.emit('note-create', newNote);
  };
  const handleNoteMove = (id: string, position: { x: number; y: number }) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, position } : n)));
    socket.emit('note-move', { id, position });
  };
  const handleNoteTextUpdate = (id: string, text: string) => {
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, text } : n)));
    socket.emit('note-update-text', { id, text });
  };
  const handleNoteDelete = (noteId: string) => {
    setNotes(prev => prev.filter(n => n.id !== noteId));
    socket.emit('note-delete', noteId);
  };
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = context;
    if (canvas && ctx) {
      ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };
  const handleClearCanvas = () => {
    clearCanvas();
    setNotes([]);
    socket.emit('clear');
  };

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    if (!storedUsername) {
      navigate('/');
      return;
    }
    
    setUsername(storedUsername);

    if (roomId) {
      socket.emit('join-room', { roomId, username: storedUsername });
    }
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = CANVAS_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
        const dataUrl = canvas.toDataURL();
        setHistoryState({ stack: [dataUrl], index: 0 });
      }
    }
    
    const handleRoomUsersUpdate = (updatedUsers: User[]) => { 
      setUsers(updatedUsers); 
    };
    
    const handleCanvasUpdate = (dataUrl: string) => {
      redrawCanvasFromDataUrl(dataUrl);
      setHistoryState(prevState => {
        const newStack = prevState.stack.slice(0, prevState.index + 1);
        newStack.push(dataUrl);
        return { stack: newStack, index: newStack.length - 1 };
      });
    };
    const handleLoadInitialState = (state: { notes: Note[], canvasState: string | null }) => {
        setNotes(state.notes || []);
        if (state.canvasState) {
            redrawCanvasFromDataUrl(state.canvasState);
            setHistoryState({ stack: [state.canvasState], index: 0 });
        }
    };
    const handleNoteDeleteEvent = (noteId: string) => setNotes(prev => prev.filter(n => n.id !== noteId));
    const handleCursorMove = (data: CursorData & { id: string }) => setCursors(prev => ({ ...prev, [data.id]: { x: data.x, y: data.y, username: data.username } }));
    const handleUserLeft = (id: string) => setCursors(prev => { const newCursors = { ...prev }; delete newCursors[id]; return newCursors; });
    const handleNoteCreate = (newNote: Note) => setNotes(prev => [...prev, newNote]);
    const handleNoteMove = (data: { id: string; position: { x: number, y: number } }) => setNotes(prev => prev.map(n => n.id === data.id ? { ...n, position: data.position } : n));
    const handleNoteTextUpdate = (data: { id: string; text: string }) => setNotes(prev => prev.map(n => n.id === data.id ? { ...n, text: data.text } : n));
    const handleClear = () => { clearCanvas(); setNotes([]); };
    socket.on('room-users-update', handleRoomUsersUpdate);
    socket.on('canvas-state-update', handleCanvasUpdate);
    socket.on('load-initial-state', handleLoadInitialState);
    socket.on('clear', handleClear);
    socket.on('note-create', handleNoteCreate);
    socket.on('note-move', handleNoteMove);
    socket.on('note-update-text', handleNoteTextUpdate);
    socket.on('note-delete', handleNoteDeleteEvent);
    socket.on('cursor-move', handleCursorMove);
    socket.on('user-left', handleUserLeft);
    return () => {
      socket.off('room-users-update', handleRoomUsersUpdate);
      socket.off('canvas-state-update', handleCanvasUpdate);
      socket.off('load-initial-state', handleLoadInitialState);
      socket.off('clear', handleClear);
      socket.off('note-create', handleNoteCreate);
      socket.off('note-move', handleNoteMove);
      socket.off('note-update-text', handleNoteTextUpdate);
      socket.off('note-delete', handleNoteDeleteEvent);
      socket.off('cursor-move', handleCursorMove);
      socket.off('user-left', handleUserLeft);
    };
  }, [roomId, context, navigate]);

  useEffect(() => {
    if (context) {
      context.strokeStyle = tool === 'pen' ? color : (tool === 'eraser' ? CANVAS_BACKGROUND_COLOR : color);
      context.fillStyle = color;
      context.lineWidth = lineWidth;
    }
  }, [color, lineWidth, context, tool]);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context) return;
    const { offsetX, offsetY } = event.nativeEvent;
    setIsDrawing(true);
    if (tool === 'pen' || tool === 'eraser') {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
    } else {
      drawingStartPoint.current = { x: offsetX, y: offsetY };
      canvasSnapshot.current = canvasRef.current?.toDataURL() || null;
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    const { offsetX, offsetY } = event.nativeEvent;
    if (tool === 'pen' || tool === 'eraser') {
      context.lineTo(offsetX, offsetY);
      context.stroke();
    } else if (drawingStartPoint.current && canvasSnapshot.current) {
      const startPoint = drawingStartPoint.current;
      const snapshot = canvasSnapshot.current;
      const img = new Image();
      img.onload = () => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.drawImage(img, 0, 0);
        context.beginPath();
        if (tool === 'rectangle') {
          context.rect(startPoint.x, startPoint.y, offsetX - startPoint.x, offsetY - startPoint.y);
        } else if (tool === 'circle') {
          const dx = offsetX - startPoint.x;
          const dy = offsetY - startPoint.y;
          const radius = Math.sqrt(dx * dx + dy * dy);
          context.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
        }
        context.stroke();
      };
      img.src = snapshot;
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (context) {
      context.closePath();
    }
    saveSnapshot();
    drawingStartPoint.current = null;
    canvasSnapshot.current = null;
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    socket.emit('cursor-move', { x: event.clientX, y: event.clientY, username });
  };

  return (
    <div
      className="bg-neutral-900 h-screen w-screen relative text-white overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-4 left-4 bg-white/10 border border-white/20 backdrop-blur-md p-2 rounded-lg shadow-lg z-20">
        <span className="text-white/70 text-sm">ROOM ID: </span>
        <span className="font-mono text-white font-bold tracking-widest">{roomId}</span>
      </div>

      <div className="absolute top-4 right-4 flex items-center space-x-[-10px] z-20">
        {users.map(user => (
          <UserAvatar key={user.id} userId={user.id} username={user.username} />
        ))}
      </div>
      {Object.entries(cursors).map(([id, data]) => (
        <LiveCursor key={id} id={id} x={data.x} y={data.y} username={data.username} />
      ))}
      {notes.map((note) => (
        <StickyNote
          key={note.id}
          note={note}
          onMove={handleNoteMove}
          onUpdateText={handleNoteTextUpdate}
          onDelete={handleNoteDelete}
        />
      ))}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 border border-white/20 backdrop-blur-md p-2 rounded-xl shadow-2xl flex items-center gap-2 z-30">
        <div className="flex items-center gap-1">
            <button onClick={handleUndo} disabled={historyState.index <= 0} className="p-3 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed" title="Undo">
              <FaUndo />
            </button>
            <button onClick={handleRedo} disabled={historyState.index >= historyState.stack.length - 1} className="p-3 rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed" title="Redo">
              <FaRedo />
            </button>
        </div>
        <div className="h-8 w-px bg-white/20"></div>

        <div className="flex items-center gap-1">
            <button className={`p-3 rounded-lg transition-colors ${tool === 'pen' ? 'bg-blue-500 text-white' : 'hover:bg-white/20'}`} onClick={() => setTool('pen')} title="Pen">
              <FaPencilAlt />
            </button>
            <button className={`p-3 rounded-lg transition-colors ${tool === 'eraser' ? 'bg-blue-500 text-white' : 'hover:bg-white/20'}`} onClick={() => setTool('eraser')} title="Eraser">
              <FaEraser />
            </button>
            <button className={`p-3 rounded-lg transition-colors ${tool === 'rectangle' ? 'bg-blue-500 text-white' : 'hover:bg-white/20'}`} onClick={() => setTool('rectangle')} title="Rectangle">
              <FaRegSquare />
            </button>
            <button className={`p-3 rounded-lg transition-colors ${tool === 'circle' ? 'bg-blue-500 text-white' : 'hover:bg-white/20'}`} onClick={() => setTool('circle')} title="Circle">
              <FaRegCircle />
            </button>
        </div>
        <div className="h-8 w-px bg-white/20"></div>
        
        <div className="flex items-center gap-1">
            <button className="p-3 rounded-lg hover:bg-white/20 transition-colors" onClick={addNote} title="Add Sticky Note">
              <FaStickyNote />
            </button>
        </div>
        <div className="h-8 w-px bg-white/20"></div>

        <div className="relative flex items-center">
            <button 
              onClick={() => setIsStylePanelOpen(!isStylePanelOpen)}
              className="w-10 h-10 rounded-lg border-2 border-white/30"
              style={{ backgroundColor: color }}
              title="Color & Stroke"
              disabled={tool === 'eraser'}
            />
            {isStylePanelOpen && (
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white/10 border border-white/20 backdrop-blur-md p-4 rounded-xl shadow-2xl w-64"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {PRESET_COLORS.map(preset => (
                    <button
                      key={preset}
                      onClick={() => { setColor(preset); }}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${color === preset ? 'border-blue-400 scale-110' : 'border-white/20'}`}
                      style={{ backgroundColor: preset }}
                    />
                  ))}
                  <div className="relative w-10 h-10">
                    <input 
                      type="color" 
                      value={color} 
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-full bg-transparent rounded-full cursor-pointer opacity-0 absolute inset-0"
                    />
                    <div className="w-full h-full rounded-full border-2 border-white/20" style={{ background: `conic-gradient(from 90deg, red, yellow, lime, aqua, blue, magenta, red)`}}></div>
                  </div>
                </div>
                <label className="text-xs text-white/70 block mb-1">Stroke Width</label>
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={lineWidth} 
                  onChange={(e) => setLineWidth(Number(e.target.value))} 
                  className="w-full cursor-pointer" 
                />
              </div>
            )}
        </div>
        <div className="h-8 w-px bg-white/20"></div>

        <div className="flex items-center gap-1">
            <button onClick={handleClearCanvas} title="Clear All" className="p-3 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors">
              <FaTrash />
            </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onMouseLeave={stopDrawing}
        className="absolute top-0 left-0"
        onClick={() => isStylePanelOpen && setIsStylePanelOpen(false)}
      />
    </div>
  );
};

export default Whiteboard;
