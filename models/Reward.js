const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  pointsRequired: {
    type: Number,
    required: true,
    min: 1
  },
  category: {
    type: String,
    enum: ['discount', 'free_service', 'product', 'special_offer'],
    default: 'discount'
  },
  value: {
    type: String,
    required: true // e.g., "20% off", "$10 off", "Free haircut"
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  maxRedemptions: {
    type: Number,
    default: null // null means unlimited
  },
  currentRedemptions: {
    type: Number,
    default: 0
  },
  terms: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Check if reward is available
rewardSchema.methods.isAvailable = function() {
  const now = new Date();
  
  if (!this.isActive) return false;
  if (this.validFrom && this.validFrom > now) return false;
  if (this.validUntil && this.validUntil < now) return false;
  if (this.maxRedemptions && this.currentRedemptions >= this.maxRedemptions) return false;
  
  return true;
};

// Redeem reward
rewardSchema.methods.redeem = function() {
  if (!this.isAvailable()) {
    throw new Error('Reward is not available for redemption');
  }
  
  this.currentRedemptions += 1;
  return this.save();
};

// Index for efficient queries
rewardSchema.index({ isActive: 1, pointsRequired: 1 });
rewardSchema.index({ category: 1 });

module.exports = mongoose.model('Reward', rewardSchema);
