const { Client } = require("@googlemaps/google-maps-services-js");

const mapsClient = new Client({});
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

const getOptimalRoute = async (origin, destination, waypoints = []) => {
  if (!apiKey) {
    console.warn("Mock Google Maps Route generated");
    return {
      distance: "10 mi",
      duration: "25 mins",
      polyline: "mock_polyline"
    };
  }

  try {
    const response = await mapsClient.directions({
      params: {
        origin,
        destination,
        waypoints,
        optimize: true, // This enables AI pathfinding optimization for TSP
        key: apiKey
      }
    });

    if (response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];
      return {
        distance: leg.distance.text,
        duration: leg.duration.text,
        polyline: route.overview_polyline.points,
        steps: leg.steps
      };
    }
    return null;
  } catch (error) {
    console.error("Google Maps API error:", error);
    throw new Error("Failed to optimize route");
  }
};

module.exports = {
  getOptimalRoute
};
