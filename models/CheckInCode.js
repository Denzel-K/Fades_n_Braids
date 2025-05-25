const mongoose = require('mongoose');

const checkInCodeSchema = new mongoose.Schema({
  qrCode: {
    type: String,
    required: true,
    unique: true
  },
  digitCode: {
    type: String,
    required: true,
    unique: true,
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate new codes
checkInCodeSchema.statics.generateCodes = function() {
  const digitCode = Math.floor(100000 + Math.random() * 900000).toString();
  const qrCode = `FADESBRAIDS_${Date.now()}_${digitCode}`;
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
  
  return {
    qrCode,
    digitCode,
    expiresAt
  };
};

// Get current active code
checkInCodeSchema.statics.getCurrentCode = async function() {
  const now = new Date();
  let activeCode = await this.findOne({
    isActive: true,
    expiresAt: { $gt: now }
  }).sort({ createdAt: -1 });

  if (!activeCode) {
    // Create new code if none exists or expired
    const codeData = this.generateCodes();
    activeCode = await this.create(codeData);
  }

  return activeCode;
};

// Validate code
checkInCodeSchema.statics.validateCode = async function(code) {
  const now = new Date();
  const validCode = await this.findOne({
    $or: [
      { qrCode: code },
      { digitCode: code }
    ],
    isActive: true,
    expiresAt: { $gt: now }
  });

  if (validCode) {
    validCode.usageCount += 1;
    await validCode.save();
    return true;
  }

  return false;
};

module.exports = mongoose.model('CheckInCode', checkInCodeSchema);
