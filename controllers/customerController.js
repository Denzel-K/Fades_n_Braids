const { validationResult } = require('express-validator');
const Customer = require('../models/Customer');
const Visit = require('../models/Visit');
const CheckInCode = require('../models/CheckInCode');
const Reward = require('../models/Reward');
const Business = require('../models/Business');
const { generateToken } = require('../middleware/authMiddleware');

// Register customer
const registerCustomer = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, password, firstName, lastName, email } = req.body;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this phone number already exists'
      });
    }

    // Get business settings for welcome bonus
    const business = await Business.findOne();
    const welcomeBonus = business?.settings?.welcomeBonus || 50;

    // Create customer
    const customer = new Customer({
      phone,
      password,
      firstName,
      lastName,
      email,
      totalPoints: welcomeBonus,
      availablePoints: welcomeBonus,
      rewards: [] // Ensure rewards array is initialized
    });

    await customer.save();

    // Generate token
    const token = generateToken(customer._id, 'customer');

    // Set cookie
    res.cookie('customerToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: `Welcome to Fades n Braids! You've earned ${welcomeBonus} welcome points!`,
      data: {
        customer: customer.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login customer
const loginCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { phone, password } = req.body;

    // Find customer
    const customer = await Customer.findOne({ phone });
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Check password
    const isPasswordValid = await customer.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password'
      });
    }

    // Check if customer is active
    if (!customer.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Generate token
    const token = generateToken(customer._id, 'customer');

    // Set cookie
    res.cookie('customerToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        customer: customer.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Customer login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Logout customer
const logoutCustomer = (req, res) => {
  res.clearCookie('customerToken');
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

// Get customer profile
const getProfile = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id)
      .populate('rewards.rewardId')
      .select('-password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: { customer }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update customer profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { firstName, lastName, email } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      req.customer._id,
      { firstName, lastName, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { customer }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Check in customer
const checkIn = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Check-in code is required'
      });
    }

    // Validate the code
    const isValidCode = await CheckInCode.validateCode(code);
    if (!isValidCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired check-in code'
      });
    }

    // Get business settings
    const business = await Business.findOne();
    const pointsPerVisit = business?.settings?.pointsPerVisit || 10;

    // Create visit record
    const visit = new Visit({
      customer: req.customer._id,
      checkInCode: code,
      pointsEarned: pointsPerVisit
    });

    await visit.save();

    // Update customer points and visit count
    const customer = await Customer.findById(req.customer._id);
    customer.totalVisits += 1;
    customer.totalPoints += pointsPerVisit;
    customer.availablePoints += pointsPerVisit;
    customer.lastVisit = new Date();
    await customer.save();

    res.json({
      success: true,
      message: `Check-in successful! You earned ${pointsPerVisit} points.`,
      data: {
        pointsEarned: pointsPerVisit,
        totalPoints: customer.totalPoints,
        availablePoints: customer.availablePoints,
        totalVisits: customer.totalVisits
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Check-in failed',
      error: error.message
    });
  }
};

// Get customer visit history
const getVisitHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const visits = await Visit.find({ customer: req.customer._id })
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalVisits = await Visit.countDocuments({ customer: req.customer._id });
    const totalPages = Math.ceil(totalVisits / limit);

    res.json({
      success: true,
      data: {
        visits,
        pagination: {
          currentPage: page,
          totalPages,
          totalVisits,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get visit history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get visit history',
      error: error.message
    });
  }
};

// Get available rewards
const getAvailableRewards = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id);

    const rewards = await Reward.find({
      isActive: true,
      pointsRequired: { $lte: customer.availablePoints }
    }).sort({ pointsRequired: 1 });

    const availableRewards = rewards.filter(reward => reward.isAvailable());

    res.json({
      success: true,
      data: {
        rewards: availableRewards,
        customerPoints: customer.availablePoints
      }
    });
  } catch (error) {
    console.error('Get available rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available rewards',
      error: error.message
    });
  }
};

// Redeem reward
const redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.params;

    const reward = await Reward.findById(rewardId);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    if (!reward.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Reward is not available'
      });
    }

    const customer = await Customer.findById(req.customer._id);

    if (customer.availablePoints < reward.pointsRequired) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points'
      });
    }

    // Redeem the reward
    await reward.redeem();
    await customer.usePoints(reward.pointsRequired);

    // Add to customer's rewards history
    customer.rewards.push({
      rewardId: reward._id,
      pointsUsed: reward.pointsRequired
    });
    await customer.save();

    res.json({
      success: true,
      message: 'Reward redeemed successfully!',
      data: {
        reward,
        pointsUsed: reward.pointsRequired,
        remainingPoints: customer.availablePoints
      }
    });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to redeem reward',
      error: error.message
    });
  }
};

// Get claimed rewards
const getClaimedRewards = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer._id)
      .populate('rewards.rewardId', 'title description value category pointsRequired')
      .select('rewards');

    // Filter out any rewards where the rewardId is null (deleted rewards)
    const claimedRewards = customer.rewards
      .filter(reward => reward.rewardId)
      .map(reward => ({
        ...reward.rewardId.toObject(),
        redeemedAt: reward.redeemedAt,
        pointsUsed: reward.pointsUsed,
        claimedId: reward._id
      }))
      .sort((a, b) => new Date(b.redeemedAt) - new Date(a.redeemedAt));

    res.json({
      success: true,
      data: {
        claimedRewards,
        totalClaimed: claimedRewards.length
      }
    });
  } catch (error) {
    console.error('Get claimed rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get claimed rewards',
      error: error.message
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  getProfile,
  updateProfile,
  checkIn,
  getVisitHistory,
  getAvailableRewards,
  redeemReward,
  getClaimedRewards
};