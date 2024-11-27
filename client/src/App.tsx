import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SessionListTable from './components/SessionListTable';
import SessionPage from './pages/SessionPage';
import SessionDetails from './pages/SessionDetails';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-950 text-white">
        <Routes>
          <Route path="/" element={<SessionListTable />} />
          <Route path="/sessions/:id" element={<SessionPage />} />
          <Route path="/sessions/:id/details" element={<SessionDetails/>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

