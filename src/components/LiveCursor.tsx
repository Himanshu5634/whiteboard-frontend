// Import the new named Cursor component

import { Cursor } from "../assets/icons";

interface LiveCursorProps {
  id: string;
  x: number;
  y: number;
  username: string;
}

const generateColor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - c.length) + c;
};


const LiveCursor = ({ id, x, y, username }: LiveCursorProps) => {
  const color = generateColor(id);

  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.1s ease-out',
        zIndex: 9999,
      }}
    >
      {/* --- THIS IS THE CHANGE --- */}
      {/* The old icon is replaced with your new Cursor component */}
      <Cursor color={color} />
      <span
        className="absolute top-5 left-3 px-2 py-1 text-xs text-white rounded"
        style={{ backgroundColor: color }}
      >
        {username}
      </span>
    </div>
  );
};

export default LiveCursor;
