import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoomRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Generate a simple unique ID for the new room
    const newRoomId = crypto.randomUUID();
    // Redirect the user to the new room's URL
    navigate(`/board/${newRoomId}`);
  }, [navigate]);

  // Render a loading message while redirecting
  return <div>Creating a new board...</div>;
};

export default RoomRedirect;