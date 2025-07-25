import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaArrowRight } from 'react-icons/fa';
import OtpInput from 'react-otp-input';
import { Logo } from '../assets/icons';
// --- UPDATED: Using a named import for the Logo ---

interface RecentBoard {
  roomId: string;
  username: string;
}

const HomePage = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [modal, setModal] = useState<'create' | 'join' | null>(null);
  const [recentBoards, setRecentBoards] = useState<RecentBoard[]>([]);

  useEffect(() => {
    const storedBoards = localStorage.getItem('recentBoards');
    if (storedBoards) {
      setRecentBoards(JSON.parse(storedBoards));
    }
  }, []);

  const saveToRecentBoards = (board: RecentBoard) => {
    const updatedBoards = [board, ...recentBoards.filter(b => b.roomId !== board.roomId)].slice(0, 3);
    setRecentBoards(updatedBoards);
    localStorage.setItem('recentBoards', JSON.stringify(updatedBoards));
  };

  const handleNavigateToBoard = (board: RecentBoard) => {
    sessionStorage.setItem('username', board.username);
    navigate(`/board/${board.roomId}`);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      const newRoomId = Math.floor(100000 + Math.random() * 900000).toString();
      const boardData = { roomId: newRoomId, username: username.trim() };
      saveToRecentBoards(boardData);
      handleNavigateToBoard(boardData);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && roomId.trim().length === 6) {
      const boardData = { roomId: roomId.trim(), username: username.trim() };
      saveToRecentBoards(boardData);
      handleNavigateToBoard(boardData);
    }
  };

  const closeModal = () => {
    setModal(null);
    setUsername('');
    setRoomId('');
  };

  const renderModal = () => {
    if (!modal) return null;

    const isCreateModal = modal === 'create';
    const modalTitle = isCreateModal ? 'Create a New Board' : 'Join an Existing Board';

    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 transition-opacity duration-300"
        onClick={closeModal}
      >
        <div 
          className="bg-white/10 p-8 rounded-2xl shadow-2xl border border-white/20 w-full max-w-md relative text-white"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={closeModal} className="absolute top-4 right-4 text-white/50 hover:text-white">
            <FaTimes size={20} />
          </button>
          
          <h2 className="text-2xl font-semibold text-center mb-6">{modalTitle}</h2>
          
          <form onSubmit={isCreateModal ? handleCreateRoom : handleJoinRoom}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium text-white/80 mb-2">
                Your Name
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="What should we call you?"
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
                autoFocus
              />
            </div>

            {!isCreateModal && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Room ID
                </label>
                <div className="flex justify-center">
                  <OtpInput
                    value={roomId}
                    onChange={setRoomId}
                    numInputs={6}
                    inputType="tel"
                    renderSeparator={<span className="w-2"/>}
                    renderInput={(props) => (
                      <input
                        {...props}
                        style={{
                            width: '3rem',
                            height: '3rem',
                            fontSize: '1.25rem',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            textAlign: 'center',
                            outline: 'none',
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              disabled={isCreateModal ? !username.trim() : !username.trim() || roomId.trim().length !== 6}
            >
              {isCreateModal ? 'Create & Go' : 'Join Board'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 h-screen w-screen flex flex-col items-center justify-center text-white p-4 overflow-hidden">
      <div className="text-center">
        {/* --- THE LOGO IS USED HERE --- */}
        <Logo className="w-24 h-24 mx-auto mb-6" />
        <h1 className="text-6xl font-bold mb-4">Collaborative Whiteboard</h1>
        <p className="text-white/70 text-lg mb-12">Create, share, and collaborate in real-time.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <button
          onClick={() => setModal('create')}
          className="bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors shadow-lg"
        >
          Create a New Board
        </button>
        <button
          onClick={() => setModal('join')}
          className="bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20 text-white font-bold py-4 px-8 rounded-xl text-xl transition-colors shadow-lg"
        >
          Join a Board
        </button>
      </div>
      
      {recentBoards.length > 0 && (
        <div className="mt-16 w-full max-w-2xl">
            <h3 className="text-lg text-white/70 mb-4 text-center">Your Recent Boards</h3>
            <div className="space-y-3">
                {recentBoards.map(board => (
                    <button 
                        key={board.roomId}
                        onClick={() => handleNavigateToBoard(board)}
                        className="w-full bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-lg flex justify-between items-center hover:bg-white/10 transition-colors"
                    >
                        <div>
                            <p className="font-bold text-lg">Room {board.roomId}</p>
                            <p className="text-sm text-white/60">Joined as {board.username}</p>
                        </div>
                        <FaArrowRight />
                    </button>
                ))}
            </div>
        </div>
      )}

      {renderModal()}
    </div>
  );
};

export default HomePage;
