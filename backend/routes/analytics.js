const express = require('express');
const router = express.Router();
const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Demand Forecasting
router.post('/demand', async (req, res) => {
  try {
    const { shelter_id, historical_claims, day_of_week } = req.body;
    
    const response = await axios.post(`${ML_SERVICE_URL}/forecast/demand`, {
      shelter_id,
      historical_claims,
      day_of_week
    });
    
    res.json(response.data);
  } catch (err) {
    console.error("ML Service Error (Demand):", err.message);
    res.status(500).json({ error: 'Failed to fetch demand forecast from ML service' });
  }
});

// Wastage Pattern Analysis
router.post('/wastage', async (req, res) => {
  try {
    const { donor_id, historical_donations } = req.body;
    
    const response = await axios.post(`${ML_SERVICE_URL}/analysis/wastage`, {
      donor_id,
      historical_donations
    });
    
    res.json(response.data);
  } catch (err) {
    console.error("ML Service Error (Wastage):", err.message);
    res.status(500).json({ error: 'Failed to fetch wastage analysis from ML service' });
  }
});

module.exports = router;
