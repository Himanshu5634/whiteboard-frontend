import { useRef } from 'react';
import Draggable from 'react-draggable';
import { FaTimes } from 'react-icons/fa'; // Import the 'X' icon

export interface Note {
  id: string;
  text: string;
  position: { x: number; y: number };
}

interface StickyNoteProps {
  note: Note;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onUpdateText: (id: string, text: string) => void;
  onDelete: (id: string) => void; // Add the new onDelete prop
}

const StickyNote = ({ note, onMove, onUpdateText, onDelete }: StickyNoteProps) => {
  const nodeRef = useRef(null);

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".handle"
      defaultPosition={note.position}
      onStop={(_e, data) => {
        onMove(note.id, { x: data.x, y: data.y });
      }}
    >
      <div ref={nodeRef} className="absolute w-60 h-60 shadow-lg z-10" style={{ cursor: 'default' }}>
        <div className="handle bg-yellow-300 h-8 w-full cursor-move rounded-t-lg relative">
          {/* --- NEW: Delete Button --- */}
          <button
            onClick={() => onDelete(note.id)}
            className="absolute top-1 right-1 text-gray-600 hover:text-black"
            title="Delete Note"
          >
            <FaTimes />
          </button>
        </div>
        <textarea
          value={note.text}
          onChange={(e) => onUpdateText(note.id, e.target.value)}
          className="w-full h-52 bg-yellow-200 p-2 text-black resize-none rounded-b-lg focus:outline-none"
          placeholder="Type something..."
        />
      </div>
    </Draggable>
  );
};

export default StickyNote;
