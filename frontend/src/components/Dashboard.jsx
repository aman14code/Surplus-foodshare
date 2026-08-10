import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { MapPin, Clock, Package } from 'lucide-react';

const Dashboard = () => {
  const [donations, setDonations] = useState([]);
  const [socket, setSocket] = useState(null);

  // We are using a mock location for the shelter/volunteer (e.g., center of a city)
  const userLocation = { lng: -122.4194, lat: 37.7749 };

  useEffect(() => {
    // Connect to Socket.io
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join', { role: 'Shelter' });
    });

    // Listen for new donations
    newSocket.on('new_donation', (donation) => {
      // In a real app, we'd check distance here or backend would only emit to nearby rooms
      setDonations(prev => [donation, ...prev]);
    });

    newSocket.on('donation_claimed', (updatedDonation) => {
      setDonations(prev => 
        prev.map(d => d._id === updatedDonation._id ? updatedDonation : d)
      );
    });

    // Initial fetch of nearby donations
    fetch(`http://localhost:5000/api/donations/nearby?lng=${userLocation.lng}&lat=${userLocation.lat}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setDonations(data);
      })
      .catch(err => console.error("Failed to fetch donations", err));

    return () => newSocket.close();
  }, []);

  const claimDonation = async (id) => {
    try {
      // Mock shelter ID
      const res = await fetch(`http://localhost:5000/api/donations/${id}/claim`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimedById: 'mock_shelter_id' })
      });
      if (!res.ok) throw new Error('Failed to claim');
      
      // We don't necessarily need to update state here because the socket event 'donation_claimed' will handle it.
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Nearby Food Donations</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Real-time feed of available surplus food within a 5-mile radius.
      </p>

      <div className="card-grid">
        {donations.length === 0 ? (
          <p className="glass-panel" style={{ padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
            No nearby donations available right now. We'll notify you when one appears!
          </p>
        ) : (
          donations.map((donation) => (
            <div key={donation._id} className="glass-panel donation-card">
              <div className="card-header">
                <h3>{donation.title}</h3>
                <span className={`badge ${donation.status === 'Available' ? 'badge-available' : 'badge-claimed'}`}>
                  {donation.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Package size={16} /> {donation.quantity}
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} /> {donation.donor?.name || 'Local Restaurant'}
                </p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} /> Expires: {new Date(donation.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>

              {donation.status === 'Available' && (
                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: 'auto' }}
                  onClick={() => claimDonation(donation._id)}
                >
                  Claim Food
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
