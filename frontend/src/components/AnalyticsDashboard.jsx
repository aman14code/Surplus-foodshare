import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [demandData, setDemandData] = useState(null);
  const [wastageData, setWastageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      // Mock data payload since we don't have historical DB data yet
      const demandRes = await fetch('http://localhost:5000/api/analytics/demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shelter_id: 'shelter123',
          historical_claims: [10, 12, 8, 15, 20, 25, 18],
          day_of_week: new Date().getDay()
        })
      });
      
      const wastageRes = await fetch('http://localhost:5000/api/analytics/wastage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: 'donor123',
          historical_donations: [
            { date: '2023-10-01', quantity: 50, claimed: 45 },
            { date: '2023-10-02', quantity: 60, claimed: 60 },
            { date: '2023-10-03', quantity: 40, claimed: 20 }
          ]
        })
      });

      if (!demandRes.ok || !wastageRes.ok) throw new Error('Failed to load AI analytics');
      
      const demandJson = await demandRes.json();
      const wastageJson = await wastageRes.json();

      setDemandData(demandJson);
      setWastageData(wastageJson);
    } catch (err) {
      console.error(err);
      setError('Ensure the Python ML service is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <TrendingUp color="var(--primary)" /> AI Insights & Analytics
      </h2>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Analyzing historical data with AI...</div>
      ) : (
        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {/* Demand Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>Predicted Demand (Today)</h3>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              {demandData?.predicted_demand || '0'} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>meals</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Based on historical claims and day-of-week trends.
            </p>
          </div>

          {/* Wastage Card */}
          <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>Wastage Analysis</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning)', marginBottom: '0.5rem' }}>
              <TrendingDown /> 
              {wastageData?.analysis?.wastage_rate ? `${(wastageData.analysis.wastage_rate * 100).toFixed(1)}%` : '0%'}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Average unclaimed food rate over recent donations.
            </p>
            {wastageData?.analysis?.recommendation && (
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--primary)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                <strong>Recommendation:</strong> {wastageData.analysis.recommendation}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
