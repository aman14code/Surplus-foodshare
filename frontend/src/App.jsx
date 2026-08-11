import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CreateDonation from './components/CreateDonation';
import Chatbot from './components/Chatbot';
import Login from './components/Login';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import RouteMap from './components/RouteMap';
import { AuthContext } from './context/AuthContext';
import './index.css';

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <Router>
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          <Leaf color="#10b981" />
          SurplusShare
        </Link>
        <div className="nav-links">
          <Link to="/">Dashboard</Link>
          {user && <Link to="/donate">Donate Food</Link>}
          {user && <Link to="/map">Map</Link>}
          {user && user.role === 'Donor' && <Link to="/analytics">Analytics</Link>}
          {user ? (
            <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.25rem 1rem' }}>Logout ({user.name})</button>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.25rem 1rem', textDecoration: 'none' }}>Login</Link>
          )}
        </div>
      </nav>
      
      <main className="container animate-in">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/donate" element={<CreateDonation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/map" element={<RouteMap />} />
        </Routes>
      </main>
      <Chatbot />
    </Router>
  );
}

export default App;
