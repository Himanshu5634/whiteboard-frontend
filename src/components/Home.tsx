import { useState } from "react";
import { Plus, LogIn, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const [modalType, setModalType] = useState<"create" | "join" | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleAction = () => {
    if (!inputValue.trim()) return;
    const roomId = modalType === "create" ? `room-${Date.now()}` : inputValue.trim();
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black text-black dark:text-white px-4">
      {/* Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-8 w-full max-w-md text-center shadow">
        <div className="flex justify-center mb-2">
          <Users className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-semibold">Collaborative Whiteboard</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-6">Create a new room or join an existing one to start collaborating</p>

        <div className="space-y-3">
          <button
            onClick={() => setModalType("create")}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-md font-semibold flex items-center justify-center gap-2 hover:opacity-90">
            <Plus className="w-4 h-4" />
            Create New Room
          </button>

          <button
            onClick={() => setModalType("join")}
            className="w-full border border-gray-300 dark:border-gray-700 text-black dark:text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-800">
            <LogIn className="w-4 h-4" />
            Join Existing Room
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg w-full max-w-md relative">
            <button onClick={() => setModalType(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-semibold mb-4">{modalType === "create" ? "Create New Room" : "Join Existing Room"}</h2>

            <input
              type="text"
              placeholder={modalType === "create" ? "Enter room name" : "Enter room ID"}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-800 dark:text-white"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            <button onClick={handleAction} className="mt-4 w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-md font-semibold hover:opacity-90 transition">
              {modalType === "create" ? "Create Room" : "Join Room"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
