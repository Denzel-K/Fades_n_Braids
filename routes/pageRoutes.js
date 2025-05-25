const express = require('express');
const router = express.Router();

const {
  getLandingPage,
  getCustomerDashboard,
  getCustomerLogin,
  getCustomerRegister,
  getBusinessLogin,
  getBusinessDashboard,
  getCheckInCodes
} = require('../controllers/pageController');

const {
  optionalAuth,
  authenticateCustomer,
  authenticateBusiness
} = require('../middleware/authMiddleware');

// Public routes
router.get('/', optionalAuth, getLandingPage);

// Customer routes
router.get('/customer/login', optionalAuth, getCustomerLogin);
router.get('/customer/register', optionalAuth, getCustomerRegister);
router.get('/customer/dashboard', authenticateCustomer, getCustomerDashboard);

// Business routes
router.get('/business/login', optionalAuth, getBusinessLogin);
router.get('/business/dashboard', authenticateBusiness, getBusinessDashboard);
router.get('/business/checkin-codes', authenticateBusiness, getCheckInCodes);

module.exports = router;