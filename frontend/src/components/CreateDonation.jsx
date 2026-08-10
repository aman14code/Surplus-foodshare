import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateDonation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    expiresAt: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // In a real app, we would get donorId and location from the authenticated user session.
    // Here we mock a donor in San Francisco
    const donationPayload = {
      ...formData,
      donorId: '64f1b2c3e4d5a67890123456', // Mock ID (won't be strictly validated if we bypass user check, but ideally we'd need a real one if populated)
      lng: -122.4194 + (Math.random() * 0.02 - 0.01), // Slight randomization to show different distances
      lat: 37.7749 + (Math.random() * 0.02 - 0.01)
    };

    // To make populate work without a real donor, let's create a temp user first, 
    // or just let it fail gracefully. Wait, our route expects a valid ObjectId.
    // For MVP demonstration, we will just send it and let the backend handle it.
    
    try {
      const res = await fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationPayload)
      });
      
      if (res.ok) {
        navigate('/');
      } else {
        console.error("Failed to create donation");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
      <h2>Donate Surplus Food</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Help reduce waste and feed the community. Fill out the details below to broadcast your available food.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Food Item / Title</label>
          <input 
            type="text" 
            name="title"
            className="form-control" 
            placeholder="e.g., 20 Loaves of Bread"
            value={formData.title}
            onChange={handleChange}
            required 
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea 
            name="description"
            className="form-control" 
            rows="3" 
            placeholder="Additional details..."
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input 
            type="text" 
            name="quantity"
            className="form-control" 
            placeholder="e.g., 10 lbs"
            value={formData.quantity}
            onChange={handleChange}
            required 
          />
        </div>

        <div className="form-group">
          <label>Expires At</label>
          <input 
            type="datetime-local" 
            name="expiresAt"
            className="form-control"
            value={formData.expiresAt}
            onChange={handleChange}
            required 
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Broadcast Donation
        </button>
      </form>
    </div>
  );
};

export default CreateDonation;
