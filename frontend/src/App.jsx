import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CreateDonation from './components/CreateDonation';
import './index.css';

function App() {
  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          <Leaf color="#10b981" />
          SurplusShare
        </Link>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          <Link to="/donate">Donate Food</Link>
        </div>
      </nav>
      
      <main className="container animate-in">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/donate" element={<CreateDonation />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
