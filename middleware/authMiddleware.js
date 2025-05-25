const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Business = require('../models/Business');

// Generate JWT token
const generateToken = (id, type = 'customer') => {
  return jwt.sign(
    { id, type },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Customer authentication middleware
const authenticateCustomer = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.customerToken) {
      token = req.cookies.customerToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (decoded.type !== 'customer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.'
      });
    }

    // Get customer from database
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer || !customer.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Customer not found or inactive.'
      });
    }

    req.customer = customer;
    next();
  } catch (error) {
    console.error('Customer authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Business authentication middleware
const authenticateBusiness = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.businessToken) {
      token = req.cookies.businessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    if (decoded.type !== 'business') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.'
      });
    }

    // Get business from database
    const business = await Business.findById(decoded.id).select('-password');

    if (!business || !business.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Business not found or inactive.'
      });
    }

    req.business = business;
    next();
  } catch (error) {
    console.error('Business authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.customerToken) {
      token = req.cookies.customerToken;
    } else if (req.cookies.businessToken) {
      token = req.cookies.businessToken;
    }

    if (token) {
      const decoded = verifyToken(token);

      if (decoded.type === 'customer') {
        const customer = await Customer.findById(decoded.id).select('-password');
        if (customer && customer.isActive) {
          req.customer = customer;
        }
      } else if (decoded.type === 'business') {
        const business = await Business.findById(decoded.id).select('-password');
        if (business && business.isActive) {
          req.business = business;
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateCustomer,
  authenticateBusiness,
  optionalAuth
};