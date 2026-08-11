const express = require('express');
const router = express.Router();
const { getOptimalRoute } = require('../services/routingService');

router.post('/optimal', async (req, res) => {
  try {
    const { origin, destination, waypoints } = req.body;
    
    if (!origin || !destination) {
      return res.status(400).json({ error: 'Origin and destination are required' });
    }

    const route = await getOptimalRoute(origin, destination, waypoints);
    if (!route) {
      return res.status(404).json({ error: 'No route found' });
    }

    res.json(route);
  } catch (err) {
    console.error("Routing Error:", err.message);
    res.status(500).json({ error: 'Failed to calculate optimal route' });
  }
});

module.exports = router;
