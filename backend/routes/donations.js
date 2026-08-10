const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');

// GET nearby available donations
router.get('/nearby', async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query; // maxDistance in meters, 5000m ~ 3.1 miles

    if (!lng || !lat) {
      return res.status(400).json({ error: 'Longitude and latitude are required' });
    }

    const donations = await Donation.find({
      status: 'Available',
      pickupLocation: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).populate('donor', 'name address contactPhone');

    res.json(donations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

const multer = require('multer');
const { analyzeFoodImage } = require('../services/aiService');

// Configure multer for memory storage (we will just pass the buffer to AI)
const upload = multer({ storage: multer.memoryStorage() });

// POST a new donation
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, quantity, donorId, lng, lat, expiresAt } = req.body;
    let aiAnalysis = null;

    if (req.file) {
      try {
        aiAnalysis = await analyzeFoodImage(req.file.buffer, req.file.mimetype);
      } catch (aiErr) {
        console.error("AI processing failed, continuing without AI analysis:", aiErr);
      }
    }

    const newDonation = new Donation({
      title,
      description,
      quantity,
      donor: donorId,
      pickupLocation: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)]
      },
      aiAnalysis,
      expiresAt: new Date(expiresAt)
    });

    const savedDonation = await newDonation.save();
    
    // Populate donor details before emitting
    await savedDonation.populate('donor', 'name address');

    // Emit event to all connected clients (in production, we'd emit only to nearby clients)
    req.io.to('food_feed').emit('new_donation', savedDonation);

    res.status(201).json(savedDonation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT to claim a donation
router.put('/:id/claim', async (req, res) => {
  try {
    const { id } = req.params;
    const { claimedById } = req.body; // Shelter or Volunteer ID

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }
    if (donation.status !== 'Available') {
      return res.status(400).json({ error: 'Donation is no longer available' });
    }

    donation.status = 'Claimed';
    donation.claimedBy = claimedById;
    const updatedDonation = await donation.save();

    req.io.to('food_feed').emit('donation_claimed', updatedDonation);

    res.json(updatedDonation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
