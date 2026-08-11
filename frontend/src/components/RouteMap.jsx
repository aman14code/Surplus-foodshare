import React, { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px'
};

const center = {
  lat: 40.7128,
  lng: -74.0060 // Default to NYC, in reality should be user's location
};

// You should put your actual API key here or in env for production
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

const RouteMap = () => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY
  });

  const [directions, setDirections] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateRoute = async () => {
    setLoading(true);
    setError('');
    try {
      // Assuming a volunteer is logged in, their location is the origin
      // and they are visiting some donation points as waypoints, ending at a shelter.
      const origin = "Times Square, New York, NY";
      const destination = "Central Park, New York, NY";
      const waypoints = ["Empire State Building, New York, NY"]; // example waypoint

      const res = await fetch('http://localhost:5000/api/routes/optimal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, waypoints })
      });
      
      const routeData = await res.json();
      
      if (res.ok && window.google) {
        // If we get polyline/steps, we can manually draw, but it's easier to use DirectionsService in frontend
        // However, since backend calculates optimal route via TSP, we request it in frontend directly to render.
        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin: origin,
            destination: destination,
            waypoints: waypoints.map(wp => ({ location: wp, stopover: true })),
            optimizeWaypoints: true,
            travelMode: window.google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(result);
            } else {
              setError(`Directions request failed: ${status}`);
            }
          }
        );
      } else {
        if (!window.google) setError("Google Maps script not loaded yet.");
        else setError(routeData.error || "Failed to fetch route");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to calculate route");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      // Attempt to load route when map is ready
      calculateRoute();
    }
  }, [isLoaded]);

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <MapPin color="var(--primary)" /> Optimal Pickup Route
      </h2>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        This map displays the AI-optimized route for picking up available surplus food and dropping it off at the nearest shelter.
      </p>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
          {error}
          <br/>
          <em>Note: You need a valid Google Maps API Key for the map to render.</em>
        </div>
      )}

      <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={12}
          options={{
            styles: [
              // Dark mode map styles can go here for better UI match
              { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
              { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
            ]
          }}
        >
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
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
