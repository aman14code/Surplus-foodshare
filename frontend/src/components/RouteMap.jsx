import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const RouteMap = () => {
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  // Hardcoded coordinates for the demo
  const origin = [40.7580, -73.9855]; // Times Square
  const waypoint = [40.7484, -73.9857]; // Empire State
  const destination = [40.7812, -73.9665]; // Central Park
  const polylineCoords = [origin, waypoint, destination];

  const calculateRoute = async () => {
    setLoading(true);
    try {
      // Simulate backend call
      const res = await fetch('http://localhost:5000/api/routes/optimal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: "Times Square", destination: "Central Park" })
      });
      
      const routeData = await res.json();
      setRouteInfo(routeData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateRoute();
  }, []);

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <MapPin color="var(--primary)" /> Optimal Pickup Route
      </h2>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        This map displays the AI-optimized route for picking up available surplus food and dropping it off at the nearest shelter.
      </p>

      {routeInfo && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
           <div><strong>Est. Distance:</strong> {routeInfo.distance || '3.2 mi'}</div>
           <div><strong>Est. Duration:</strong> {routeInfo.duration || '15 mins'}</div>
        </div>
      )}

      <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden', height: '500px' }}>
        <MapContainer center={[40.7580, -73.9750]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          />
          <Marker position={origin}>
            <Popup>Start: Times Square (Volunteer)</Popup>
          </Marker>
          <Marker position={waypoint}>
            <Popup>Pickup: Empire State Building</Popup>
          </Marker>
          <Marker position={destination}>
            <Popup>Dropoff: Central Park Shelter</Popup>
          </Marker>
          <Polyline positions={polylineCoords} color="#10b981" weight={5} opacity={0.7} dashArray="10, 10" />
        </MapContainer>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={calculateRoute} className="btn btn-primary" disabled={loading}>
          {loading ? 'Recalculating...' : 'Refresh Route'}
        </button>
      </div>
    </div>
  );
};

export default RouteMap;
