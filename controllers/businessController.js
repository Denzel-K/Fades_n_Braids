const { validationResult } = require('express-validator');
const qrcode = require('qrcode');
const Business = require('../models/Business');
const Customer = require('../models/Customer');
const Visit = require('../models/Visit');
const CheckInCode = require('../models/CheckInCode');
const Reward = require('../models/Reward');
const { generateToken } = require('../middleware/authMiddleware');

// Business login
const loginBusiness = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find business
    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await business.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if business is active
    if (!business.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Business account is deactivated'
      });
    }

    // Generate token
    const token = generateToken(business._id, 'business');

    // Set cookie
    res.cookie('businessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        business: business.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Business login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Business logout
const logoutBusiness = (req, res) => {
  res.clearCookie('businessToken');
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

// Get dashboard data
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get today's visits
    const todayVisits = await Visit.countDocuments({
      visitDate: { $gte: startOfDay, $lte: endOfDay }
    });

    // Get total customers
    const totalCustomers = await Customer.countDocuments({ isActive: true });

    // Get total visits
    const totalVisits = await Visit.countDocuments();

    // Get active rewards count
    const activeRewards = await Reward.countDocuments({ isActive: true });

    // Get recent visits with customer info
    const recentVisits = await Visit.find()
      .populate('customer', 'firstName lastName phone')
      .sort({ visitDate: -1 })
      .limit(10);

    // Get top customers by points
    const topCustomers = await Customer.find({ isActive: true })
      .sort({ totalPoints: -1 })
      .limit(10)
      .select('firstName lastName phone totalPoints totalVisits');

    // Get current check-in code
    const currentCode = await CheckInCode.getCurrentCode();

    // Get recent reward claims
    const recentClaims = await Customer.find({ 'rewards.0': { $exists: true } })
      .populate('rewards.rewardId', 'title value pointsRequired')
      .sort({ 'rewards.redeemedAt': -1 })
      .limit(5)
      .select('firstName lastName phone rewards');

    // Format recent claims data
    const formattedClaims = recentClaims.map(customer => {
      const latestReward = customer.rewards[0];
      return {
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone
        },
        reward: latestReward.rewardId,
        redeemedAt: latestReward.redeemedAt,
        pointsUsed: latestReward.pointsUsed
      };
    }).filter(claim => claim.reward); // Filter out claims where reward was deleted

    res.json({
      success: true,
      data: {
        stats: {
          todayVisits,
          totalCustomers,
          totalVisits,
          activeRewards
        },
        recentVisits,
        topCustomers,
        recentClaims: formattedClaims,
        currentCode
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
};

// Get current check-in codes
const getCurrentCodes = async (req, res) => {
  try {
    const currentCode = await CheckInCode.getCurrentCode();

    // Generate QR code image
    const qrCodeImage = await qrcode.toDataURL(currentCode.qrCode);

    res.json({
      success: true,
      data: {
        digitCode: currentCode.digitCode,
        qrCode: currentCode.qrCode,
        qrCodeImage,
        expiresAt: currentCode.expiresAt
      }
    });
  } catch (error) {
    console.error('Get current codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get current codes',
      error: error.message
    });
  }
};

// Get all customers
const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query)
      .select('-password')
      .sort({ totalPoints: -1 })
      .skip(skip)
      .limit(limit);

    const totalCustomers = await Customer.countDocuments(query);
    const totalPages = Math.ceil(totalCustomers / limit);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          currentPage: page,
          totalPages,
          totalCustomers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customers',
      error: error.message
    });
  }
};

// Get all rewards
const getRewards = async (req, res) => {
  try {
    const rewards = await Reward.find().sort({ pointsRequired: 1 });

    res.json({
      success: true,
      data: { rewards }
    });
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get rewards',
      error: error.message
    });
  }
};

// Create reward
const createReward = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const reward = new Reward(req.body);
    await reward.save();

    res.status(201).json({
      success: true,
      message: 'Reward created successfully',
      data: { reward }
    });
  } catch (error) {
    console.error('Create reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reward',
      error: error.message
    });
  }
};

// Update reward
const updateReward = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rewardId } = req.params;
    const reward = await Reward.findByIdAndUpdate(
      rewardId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    res.json({
      success: true,
      message: 'Reward updated successfully',
      data: { reward }
    });
  } catch (error) {
    console.error('Update reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update reward',
      error: error.message
    });
  }
};

// Delete reward
const deleteReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const reward = await Reward.findByIdAndDelete(rewardId);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    res.json({
      success: true,
      message: 'Reward deleted successfully'
    });
  } catch (error) {
    console.error('Delete reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reward',
      error: error.message
    });
  }
};

// Update business settings
const updateSettings = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const business = await Business.findByIdAndUpdate(
      req.business._id,
      { settings: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: { business }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

// Award points to customer
const awardPoints = async (req, res) => {
  try {
    const { customerId, points, reason } = req.body;

    if (!customerId || !points || points <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID and valid points amount are required'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.addPoints(points);

    // Create a visit record for manual point award
    const visit = new Visit({
      customer: customerId,
      checkInCode: 'MANUAL_AWARD',
      pointsEarned: points,
      notes: reason || 'Manual point award by business'
    });
    await visit.save();

    res.json({
      success: true,
      message: `${points} points awarded to ${customer.fullName}`,
      data: {
        customer: customer.toJSON(),
        pointsAwarded: points
      }
    });
  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to award points',
      error: error.message
    });
  }
};

module.exports = {
  loginBusiness,
  logoutBusiness,
  getDashboard,
  getCurrentCodes,
  getCustomers,
  getRewards,
  createReward,
  updateReward,
  deleteReward,
  updateSettings,
  awardPoints
};