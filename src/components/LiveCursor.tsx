import { Cursor } from "../assets/icons";

interface LiveCursorProps {
  id: string;
  x: number;
  y: number;
  username: string;
}
const generateColor = (id: string): string => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Ensure the hue is within [0, 360)
  const hue = Math.abs(hash) % 360;

  // Use high saturation and mid lightness for vibrancy
  return `hsl(${hue}, 90%, 55%)`;
};

const LiveCursor = ({ id, x, y, username }: LiveCursorProps) => {
  const color = generateColor(id);

  return (
    <div
      className="absolute top-0 left-0"
      style={{
        transform: `translate(${x}px, ${y}px)`,
        transition: "transform 0.1s ease-out", // Smooths the movement
        zIndex: 9999, // Ensure cursors are always on top
      }}>
      {/* <FaMousePointer style={{ color, fontSize: '20px' }} /> */}
      <Cursor color={color} />
      <span className="absolute top-5 left-3 px-2 py-1 text-xs text-white rounded" style={{ backgroundColor: color }}>
        {/* Display first 6 chars of the ID as a name */}
        {/* User {id.substring(0, 6)} */}
        {username ? username : id.substring(0, 6)}
      </span>
    </div>
  );
};

export default LiveCursor;
