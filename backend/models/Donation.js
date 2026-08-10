const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  quantity: { type: String, required: true }, // e.g., '20 meals', '50 lbs'
  status: {
    type: String,
    enum: ['Available', 'Claimed', 'In Transit', 'Delivered'],
    default: 'Available'
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

// 2dsphere index for querying nearby donations
donationSchema.index({ pickupLocation: '2dsphere' });

module.exports = mongoose.model('Donation', donationSchema);
