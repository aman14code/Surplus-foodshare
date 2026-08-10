const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Donor', 'Shelter', 'Volunteer'], 
    required: true 
  },
  location: {
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
  address: String,
  contactPhone: String
}, { timestamps: true });

// 2dsphere index for geospatial queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
