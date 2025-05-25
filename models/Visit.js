const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  checkInCode: {
    type: String,
    required: true
  },
  pointsEarned: {
    type: Number,
    required: true,
    default: 10
  },
  visitDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
visitSchema.index({ customer: 1, visitDate: -1 });
visitSchema.index({ checkInCode: 1 });

module.exports = mongoose.model('Visit', visitSchema);
