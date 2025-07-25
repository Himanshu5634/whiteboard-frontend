import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css';
import HomePage from './components/HomePage';
import Whiteboard from './components/Whiteboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* The root path now shows the HomePage */}
        <Route path="/" element={<HomePage />} />
        
        {/* The board path remains the same */}
        <Route path="/board/:roomId" element={<Whiteboard />} />
      </Routes>
    </Router>
  );
}

export default App;
